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
  const [sequenceIndex, setSequenceIndex] = useState(-1);
  const [unitTitle, setUnitTitle] = useState('');
  const [unitIndex, setUnitIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  const { courseId } = useSelector((state) => state.courseHome);
  const { org } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const {
    resumeCourse: { hasVisitedCourse, url: resumeCourseUrl },
    resumeIds,
    courseBlocks,
  } = useModel('outline', courseId);

  useEffect(() => {
    let isMounted = true;

    const fetchSequenceDetails = async () => {
      if (!resumeIds.unitId || !resumeIds.sequenceId) {
        if (isMounted) { setLoading(false); }
        return;
      }

      try {
        const data = await getSequenceMetadata(resumeIds.sequenceId);
        if (isMounted) {
          setSequenceDetails(data);

          const tempUnitIndex = data.units.findIndex((unit) => unit.id === resumeIds.unitId);
          if (tempUnitIndex !== -1) {
            setUnitTitle(data.units[tempUnitIndex].title);
            setUnitIndex(tempUnitIndex + 1);
          }
        }
      } catch (error) {
        if (isMounted) {
          // console.error('Failed to fetch sequence details', error);
        }
      } finally {
        if (isMounted) { setLoading(false); }
      }
    };

    fetchSequenceDetails();

    return () => {
      isMounted = false;
    };
  }, [resumeIds]);

  useEffect(() => {
    if (courseBlocks && resumeIds.sequenceId) {
      const { sectionIds } = courseBlocks.courses[Object.keys(courseBlocks.courses)[0]];
      const allSequenceIds = sectionIds.flatMap(
        (sectionId) => courseBlocks.sections[sectionId].sequenceIds,
      );
      const tempSequenceIndex = allSequenceIds.indexOf(resumeIds.sequenceId);
      setSequenceIndex(tempSequenceIndex);
    }
  }, [courseBlocks, resumeIds]);

  const titleObject = {
    module: sequenceIndex >= 0 ? `Module ${sequenceIndex + 1}` : 'Loading...',
    sequence: sequenceDetails?.sequence?.title || 'Loading...',
    unit:
      unitIndex > 0 && sequenceDetails
        ? `(${unitIndex}/${sequenceDetails.units.length}) ${unitTitle}`
        : 'Loading...',
  };

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
        title={(
          <div>
            <div className="pgn__card-header-title-md">
              {hasVisitedCourse
                ? intl.formatMessage(messages.resumeBlurb)
                : intl.formatMessage(messages.startBlurb)}
            </div>
            {hasVisitedCourse && (
              loading ? (
                <Spinner
                  animation="border"
                  variant="primary"
                  size="sm"
                  screenReaderText="loading"
                />
              ) : (
                <div
                  className="text-muted"
                  style={{ fontSize: '14px', fontWeight: '100', marginTop: '0.5rem' }}
                >
                  {titleObject.module}
                  <span
                    style={{ color: '#CC00CC', fontWeight: '500', margin: '0 0.2rem' }}
                  >
                    /
                  </span>
                  {titleObject.sequence}
                  <span
                    style={{ color: '#CC00CC', fontWeight: '500', margin: '0 0.2rem' }}
                  >
                    /
                  </span>
                  {titleObject.unit}
                </div>
              )
            )}
          </div>
        )}
        actions={(
          <Button
            variant="brand"
            block
            href={resumeCourseUrl}
            onClick={logResumeCourseClick}
          >
            {hasVisitedCourse
              ? intl.formatMessage(messages.resume)
              : intl.formatMessage(messages.start)}
          </Button>
        )}
      />
      <Card.Footer>
        <></>
      </Card.Footer>
    </Card>
  );
};

StartOrResumeCourseCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
