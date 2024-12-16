import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Button } from '@openedx/paragon';

import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';
import BookmarkFilledIcon from '../../bookmark/BookmarkFilledIcon';

const UnitButton = ({
  onClick,
  title,
  showIcon,
  contentType,
  isActive,
  bookmarked,
  complete,
  showCompletion,
  unitId,
  className,
  showTitle,
  unitsInSection,
}) => {
  const { courseId, sequenceId } = useSelector(state => state.courseware);

  const handleClick = useCallback(() => {
    onClick(unitId);
  }, [onClick, unitId]);

  let unitNumbersFraction = '';
  if (unitsInSection) {
    unitNumbersFraction = `(${unitsInSection.current}/${unitsInSection.length})`;
  }

  return (
    <Button
      className={classNames({
        active: isActive,
        complete: showCompletion && complete,
      }, className)}
      variant="link"
      onClick={handleClick}
      title={title}
      as={Link}
      to={`/course/${courseId}/${sequenceId}/${unitId}`}
    >
      {showIcon && <UnitIcon type={contentType} />}
      {showTitle && <span className="unit-title">{`${unitNumbersFraction} ${title}`}</span>}
      {showCompletion && complete ? <CompleteIcon size="sm" className="text-success ml-2" /> : null}
      {bookmarked ? (
        <BookmarkFilledIcon
          className="text-primary small position-absolute"
          style={{ top: '-3px', right: '5px' }}
        />
      ) : null}
    </Button>
  );
};

UnitButton.propTypes = {
  bookmarked: PropTypes.bool,
  className: PropTypes.string,
  complete: PropTypes.bool,
  contentType: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool,
  showTitle: PropTypes.bool,
  showIcon: PropTypes.bool,
  title: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  unitsInSection: PropTypes.shape({
    current: PropTypes.number,
    length: PropTypes.number,
  }),
};

UnitButton.defaultProps = {
  className: undefined,
  isActive: false,
  bookmarked: false,
  complete: false,
  showTitle: false,
  showIcon: true,
  showCompletion: true,
  unitsInSection: null,
};

const mapStateToProps = (state, props) => {
  if (props.unitId) {
    return {
      ...state.models.units[props.unitId],
    };
  }
  return {};
};

export default connect(mapStateToProps)(UnitButton);
