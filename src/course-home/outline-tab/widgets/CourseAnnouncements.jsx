import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { useModel } from '../../../generic/model-store';
import LmsHtmlFragment from '../LmsHtmlFragment';
import './CourseAnnouncements.scss';

const getAnnouncementState = (welcomeMessageHtml) => {
  const savedState = localStorage.getItem('announcementState');
  if (savedState) {
    try {
      const { isDismissed, message } = JSON.parse(savedState);
      if (message !== welcomeMessageHtml) {
        return { isDismissed: false, shouldOpenModal: false };
      }
      return { isDismissed, shouldOpenModal: !isDismissed };
    } catch {
      return { isDismissed: false, shouldOpenModal: false };
    }
  }
  return { isDismissed: false, shouldOpenModal: false };
};

const CourseAnnouncement = ({ courseId }) => {
  const {
    welcomeMessageHtml,
    courseTools,
    resumeCourse: { hasVisitedCourse },
  } = useModel('outline', courseId);

  const updatesTool = useMemo(
    () => courseTools.find((tool) => tool.title === 'Updates'),
    [courseTools],
  );
  const updatesLink = updatesTool?.url || null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const { isDismissed: dismissed, shouldOpenModal } = getAnnouncementState(welcomeMessageHtml);
    setIsDismissed(dismissed);
    if (hasVisitedCourse && !dismissed) {
      setIsModalOpen(shouldOpenModal);
    }

    if (!dismissed) {
      localStorage.setItem(
        'announcementState',
        JSON.stringify({ isDismissed: false, message: welcomeMessageHtml }),
      );
    }
  }, [welcomeMessageHtml, hasVisitedCourse]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsModalOpen(false);
    localStorage.setItem(
      'announcementState',
      JSON.stringify({ isDismissed: true, message: welcomeMessageHtml }),
    );
  };

  const truncateMessage = useMemo(() => {
    if (!welcomeMessageHtml) { return ''; }
    const plainText = new DOMParser().parseFromString(welcomeMessageHtml, 'text/html').body
      .textContent || '';
    return plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText;
  }, [welcomeMessageHtml]);

  if (isDismissed || !welcomeMessageHtml) {
    return null;
  }

  return (
    <div className="announcement-container">
      <div>
        <div style={{ fontSize: 'small', fontWeight: 'bold', marginBottom: '5px' }}>
          Course Announcement Update
        </div>
        <div style={{ fontSize: 'smaller' }}>{truncateMessage}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button type="button" className="announcements-dismiss-btn" onClick={handleDismiss}>
          Dismiss
        </button>
        <Button className="announcements-view-btn" onClick={() => setIsModalOpen(true)}>
          View
        </Button>
      </div>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Latest Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LmsHtmlFragment
            className="inline-link"
            data-testid="long-welcome-message-iframe"
            key="full-html"
            html={welcomeMessageHtml}
            title="Course Announcement"
          />
        </Modal.Body>
        <div className="modal-footer-announcements">
          <button
            type="button"
            className="announcements-close-modal-btn"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
          {updatesLink && (
            <Button variant="primary" href={updatesLink} aria-label="View All Announcements">
              View all announcements
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

CourseAnnouncement.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseAnnouncement;
