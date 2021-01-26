import React, { useRef, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { API, Storage } from 'aws-amplify';
import { onError } from '../libs/errorLib';
import config from '../config';
import Form from 'react-bootstrap/Form';
import LoaderButton from '../components/LoaderButton';
import { s3Upload } from '../libs/awsLib';
import './Note.css';

const Note = () => {
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    const loadNote = () => {
      return API.get('notes', `/notes/${id}`);
    };

    const onLoad = async () => {
      try {
        const note = await loadNote();
        const { content, attachment } = note;

        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment);
        }

        setContent(content);
        setNote(note);
      } catch (e) {
        onError(e);
      }
    };

    onLoad();
  }, [id]);

  const validateForm = () => {
    return content.length > 0;
  };

  const formatFileName = (str) => {
    return str.replace(/^\w+-/, '');
  };

  const handleFileChange = (e) => {
    file.current = e.target.files[0];
  };

  const saveNote = (note) => {
    return API.put('notes', `/notes/${id}`, {
      body: note,
    });
  };

  const deleteNote = () => {
    return API.del('notes', `/notes/${id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let attachment;

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }

      await saveNote({
        content,
        attachment: attachment || note.attachment,
      });
      history.push('/');
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteNote();
      history.push('/');
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  };

  return (
    <div className='note'>
      {note && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId='content'>
            <Form.Control
              value={content}
              as='textarea'
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId='file'>
            <Form.Label>Attachment</Form.Label>
            {note.attachment && (
              <p>
                <a
                  href={note.attachmentURL}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {formatFileName(note.attachment)}
                </a>
              </p>
            )}
            <Form.Control onChange={handleFileChange} type='file' />
          </Form.Group>
          <LoaderButton
            block
            type='submit'
            size='lg'
            variant='primary'
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Save
          </LoaderButton>
          <LoaderButton
            block
            size='lg'
            variant='danger'
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </LoaderButton>
        </Form>
      )}
    </div>
  );
};

export default Note;
