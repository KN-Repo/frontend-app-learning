import React, { useEffect, useState } from 'react';
import { Button, Card, Spinner } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import { getSequenceMetadata } from '../../../courseware/data/api';

const StartOrResumeCourseCard = ({ intl }) => {
  const [sequenceDetails, setSequenceDetails] = useState(null);
  const [sequenceIndex, setSequenceIndex] = useState(null);
  const [unitTitle, setUnitTitle] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const {
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },
    resumeIds,
    courseBlocks,
  } = useModel('outline', courseId);

  useEffect(() => {
    const fetchSequenceDetails = async () => {
      if (!resumeIds.unitId || !resumeIds.sequenceId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSequenceMetadata(resumeIds.sequenceId);
        setSequenceDetails(data);

        const unit = data.units.find(thisUnit => thisUnit.id === resumeIds.unitId);
        if (unit) {
          setUnitTitle(unit.title);
        }

        const seqIndex = data.units.findIndex(thisUnit => thisUnit.id === resumeIds.unitId);
        if (seqIndex !== -1) {
          setSequenceIndex(seqIndex);
        }
      } catch (error) {
        throw new Error('Failed to fetch sequence details');
      } finally {
        setLoading(false);
      }
    };

    fetchSequenceDetails();
  }, [resumeIds]);

  useEffect(() => {
    if (courseBlocks && resumeIds.sequenceId) {
      const { sectionIds } = courseBlocks.courses[Object.keys(courseBlocks.courses)[0]];
      const allSequenceIds = sectionIds.flatMap(sectionId => courseBlocks.sections[sectionId].sequenceIds);
      const tempSequenceIndex = allSequenceIds.indexOf(resumeIds.sequenceId);
      setSequenceIndex(tempSequenceIndex);
    }
  }, [courseBlocks, resumeIds]);

  // Module X / [Module Name] / [Unit Name]
  const moduleTitle = `Module ${sequenceIndex + 1} / ${sequenceDetails?.sequence.title} / ${unitTitle}`;

  if (!resumeCourseUrl) {
    return null;
  }

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
    });
  };

  return (
    <Card className="mb-3 raised-card" data-testid="start-resume-card">
      <Card.Header
        // title={hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}
        title={(
          <div>
            <div style={{ fontSize: 'larger', fontWeight: 'normal', marginBottom: '0.3rem' }}>{hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}</div>
            {loading ? (
              <Spinner animation="border" variant="primary" size="sm" screenReaderText="loading" />
            ) : (
              <div className="text-muted" style={{ fontSize: 'smaller', fontWeight: 'normal' }}>{moduleTitle}</div>
            )}
          </div>
        )}
        actions={(
          <Button
            variant="brand"
            block
            href={resumeCourseUrl}
            onClick={() => logResumeCourseClick()}
          >
            {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
          </Button>
        )}
      />
      {/* Footer is needed for internal vertical spacing to work out. If you can remove, be my guest */}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <Card.Footer><></></Card.Footer>
    </Card>
  );
};

StartOrResumeCourseCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
