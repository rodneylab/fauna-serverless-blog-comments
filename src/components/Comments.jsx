import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import React from 'react';
import Card from './Card';
import { container, dateText, footer } from './Comments.module.scss';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.locale('en-gb');

const Comments = ({ comments }) => (
  <div className={container}>
    <h2>Comments</h2>
    <ul>
      {comments.map((element) => {
        const { commentId, date, name, text } = element.node;
        const dayjsDate = dayjs(date);
        const dateString = dayjsDate.fromNow();
        return (
          <li key={commentId}>
            <Card>
              <h3>{name}</h3>
              <p>{text}</p>
              <div className={footer}>
                <small>
                  <span className={dateText}>{dateString}</span>
                </small>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  </div>
);

Comments.propTypes = PropTypes.arrayOf(
  PropTypes.shape({
    node: PropTypes.shape({
      commentId: PropTypes.string,
      date: PropTypes.string,
      name: PropTypes.string,
      text: PropTypes.text,
    }),
  }),
).isRequired;

export { Comments as default };
