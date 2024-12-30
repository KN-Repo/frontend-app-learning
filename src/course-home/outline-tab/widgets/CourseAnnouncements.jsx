import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { useModel } from '../../../generic/model-store';
import LmsHtmlFragment from '../LmsHtmlFragment';
import './CourseAnnouncements.scss';

const CourseAnnouncement = ({ courseId }) => {
  const {
    welcomeMessageHtml,
    courseTools,
    resumeCourse: { hasVisitedCourse },
  } = useModel('outline', courseId);

  const updatesTool = courseTools.find((tool) => tool.title === 'Updates');
  const updatesLink = updatesTool ? updatesTool.url : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const truncateMessage = (html, maxLength) => {
    const plainText = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
    return plainText.length > maxLength ? `${plainText.substring(0, maxLength)}...` : plainText;
  };

  const truncatedMessage = truncateMessage(welcomeMessageHtml, 100);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsModalOpen(false);
    localStorage.setItem(
      'announcementState',
      JSON.stringify({ isDismissed: true, message: truncatedMessage }),
    );
  };

  useEffect(() => {
    const savedState = localStorage.getItem('announcementState');
    if (savedState) {
      try {
        const { isDismissed: savedDismissed, message: savedMessage } = JSON.parse(savedState);
        if (savedMessage !== truncatedMessage) {
          setIsDismissed(false);
          setIsModalOpen(true);
          localStorage.setItem(
            'announcementState',
            JSON.stringify({ isDismissed: false, message: truncatedMessage }),
          );
        } else if (savedDismissed) {
          setIsDismissed(true);
        } else {
          setIsDismissed(false);
        }
      } catch {
        setIsDismissed(false);
        setIsModalOpen(true);
      }
    } else if (hasVisitedCourse) {
      setIsModalOpen(true);
      localStorage.setItem(
        'announcementState',
        JSON.stringify({ isDismissed: false, message: truncatedMessage }),
      );
    }
  }, [hasVisitedCourse, truncatedMessage]);

  if (isDismissed || !welcomeMessageHtml) {
    return null;
  }

  return (
    <div className="announcement-container">
      <div>
        <div style={{ fontSize: 'small', fontWeight: 'bold', marginBottom: '5px' }}>
          Course Announcement Update
        </div>
        <div style={{ fontSize: 'smaller' }}>{truncatedMessage}</div>
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
            <Button variant="primary" href={updatesLink}>
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
