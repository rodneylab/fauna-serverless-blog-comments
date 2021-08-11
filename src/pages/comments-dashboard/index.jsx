import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { navigate } from 'gatsby';
import React, { useState } from 'react';
import Card from '../../components/Card';
import { getSessionStorageOrDefault } from '../../utilities/utilities';
import { container, dateText } from './index.module.scss';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.locale('en-gb');

export default function CommentsDashboard() {
  const [sessionSecret] = useState(getSessionStorageOrDefault('id', false));

  if (!sessionSecret) {
    navigate('/comments-dashboard/login');
  }
  const comments = [];

  return (
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
                <div className={dateText}>
                  <small>{dateString}</small>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
