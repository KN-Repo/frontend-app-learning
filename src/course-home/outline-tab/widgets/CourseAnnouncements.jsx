import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { useModel } from '../../../generic/model-store';
import LmsHtmlFragment from '../LmsHtmlFragment';
import './CourseAnnouncements.scss';

const CourseAnnouncement = ({ courseId }) => {
  const { welcomeMessageHtml, courseTools } = useModel('outline', courseId);

  // Find the URL for the "Updates" tool
  const updatesTool = courseTools.find(tool => tool.title === 'Updates');
  const updatesLink = updatesTool ? updatesTool.url : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const handleDismiss = () => setIsDismissed(true);

  if (isDismissed) { return null; }

  const truncateMessage = (html, maxLength) => {
    const plainText = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
    return plainText.length > maxLength
      ? `${plainText.substring(0, maxLength)}...`
      : plainText;
  };

  const truncatedMessage = truncateMessage(welcomeMessageHtml, 100);

  return (
    <div className="announcement-container">
      {/* Announcement Text */}
      <div>
        <div
          style={{ fontSize: 'small', fontWeight: 'bold', marginBottom: '5px' }}
        >
          Course Announcement Update
        </div>
        <div style={{ fontSize: 'smaller' }}>{truncatedMessage}</div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button type="button" className="announcements-dismiss-btn" onClick={handleDismiss}>
          Dismiss
        </button>
        <Button className="announcements-view-btn" onClick={toggleModal}>
          View
        </Button>
      </div>

      {/* Modal */}
      <Modal
        show={isModalOpen}
        onHide={toggleModal}
        size="lg"
        centered
      >
        <Modal.Header>
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
          <button type="button" className="announcements-close-modal-btn" onClick={toggleModal}>Close</button>
          <Button variant="primary" href={updatesLink}>View all announcements</Button>
        </div>
      </Modal>
    </div>
  );
};

CourseAnnouncement.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseAnnouncement;
