import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { getSessionStorageOrDefault, isBrowser, setSessionStorage } from '../../utilities/utilities';
import { container, dateText } from './index.module.scss';
import { FlagIcon, TrashIcon } from '../../components/Icons';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.locale('en-gb');

export default function CommentsDashboard() {
  const [comments, setComments] = useState([]);
  const [sessionSecret, setSessionSecret] = useState(getSessionStorageOrDefault('token', false));
  const [showSpam, setShowSpam] = useState(true);

  if (!sessionSecret && isBrowser) {
    navigate('/comments-dashboard/login');
  }

  const getComments = async () => {
    try {
      const response = await axios({
        url: '/api/get-comments',
        method: 'POST',
        data: {
          token: sessionSecret,
          showSpam,
        },
      });
      const { comments: fetchedComments } = response.data;
      setComments(fetchedComments);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteComment = async ({ commentId }) => {
    try {
      await axios({
        url: '/api/update-comment',
        method: 'POST',
        data: {
          token: sessionSecret,
          commentId,
          moveToTrash: true,
        },
      });
      getComments();
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      await axios({
        url: '/api/db-logout',
        method: 'POST',
        data: {
          token: sessionSecret,
        },
      });
      setSessionSecret('');
      setSessionStorage('token', '');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const toggleMarkedSpam = async ({ commentId }) => {
    try {
      console.log('Logging out');
      await axios({
        url: '/api/update-comment',
        method: 'POST',
        data: {
          token: sessionSecret,
          commentId,
          setMarkedSpamTo: !showSpam,
        },
      });
      getComments();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(async () => {
    if (sessionSecret) {
      await getComments();
    }
  }, [sessionSecret, showSpam]);

  const slugs = Object.keys(comments);

  return (
    <div className={container}>
      <button type="button" onClick={logout}>
        Log out
      </button>
      {showSpam ? <h2>Comments marked spam</h2> : <h2>Comments not marked spam</h2>}
      <button type="button" onClick={() => setShowSpam(!showSpam)}>
        {showSpam ? 'Show comments not marked spam' : 'Show comments marked spam'}
      </button>
      {slugs.length > 0 ? (
        <ul>
          {slugs.map((key) => (
            <li key={key}>
              <h4>
                <Link aria-label={`Open post with slug ${key}`} to={`/${key}`}>
                  {key}
                </Link>
              </h4>
              {comments[key].map((element) => {
                const { commentId, date, name, text } = element;
                const dayjsDate = dayjs(date);
                const dateString = dayjsDate.fromNow();
                return (
                  <li key={commentId}>
                    <Card>
                      <div>
                        <h3>{name}</h3>
                        <button type="button" onClick={() => toggleMarkedSpam({ commentId })}>
                          {showSpam ? (
                            <>
                              <FlagIcon /> clear spam flag
                            </>
                          ) : (
                            'mark spam'
                          )}
                        </button>
                      </div>
                      <p>{text}</p>
                      <div className={dateText}>
                        <small>{dateString}</small>
                      </div>
                      <button type="button" onClick={() => deleteComment({ commentId })}>
                        <TrashIcon />
                      </button>
                    </Card>
                  </li>
                );
              })}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments to show!</p>
      )}
    </div>
  );
}
