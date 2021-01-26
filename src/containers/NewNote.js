import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { API } from 'aws-amplify';
import Form from 'react-bootstrap/Form';
import LoaderButton from '../components/LoaderButton';
import { s3Upload } from '../libs/awsLib';
import { onError } from '../libs/errorLib';
import config from '../config';
import './NewNote.css';

const NewNote = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const file = useRef(null);
  const history = useHistory();

  const validateForm = () => {
    return content.length > 0;
  };

  const handleFileChange = (e) => {
    file.current = e.target.files[0];
  };

  const createNote = (note) => {
    return API.post('notes', '/notes', {
      body: note,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB`
      );
      return;
    }

    setIsLoading(true);

    try {
      const attachment = file.current ? await s3Upload(file.current) : null;

      await createNote({ content, attachment });
      history.push('/');
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  };

  return (
    <div className='newNote'>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId='content'>
          <Form.Control
            value={content}
            placeholder='Add new note...'
            as='textarea'
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId='file'>
          <Form.Label>Attachment</Form.Label>
          <Form.Control type='file' onChange={handleFileChange} />
        </Form.Group>
        <LoaderButton
          block
          type='submit'
          size='lg'
          variant='primary'
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </Form>
    </div>
  );
};

export default NewNote;
