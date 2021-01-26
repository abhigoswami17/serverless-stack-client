import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { LinkContainer } from 'react-router-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import ListGroup from 'react-bootstrap/ListGroup';
import { useAppContext } from '../libs/contextLib';
import { onError } from '../libs/errorLib';
import './Home.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAppContext();

  useEffect(() => {
    const loadNotes = () => {
      return API.get('notes', '/notes');
    };
    
    const onLoad = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        setNotes(notes);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    };

    onLoad();
  }, [isAuthenticated]);

  const renderNoteList = (notes) => {
    return (
      <>
        <LinkContainer to='/notes/new'>
          <ListGroup.Item action className='py-3 text-nowrap text-truncate'>
            <BsPencilSquare size={17} />
            <span className='ml-2 font-weight-bold'>Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {notes.map(({ notesId, content, createdAt }) => (
          <LinkContainer key={notesId} to={`/notes/${notesId}`}>
            <ListGroup.Item action>
              <span className='font-weight-bold'>
                {content.trim().split('\n')[0]}
              </span>
              <br />
              <span className='text-muted'>
                Created: {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  };

  const renderLander = () => {
    return (
      <div className='lander'>
        <h1>Scratch</h1>
        <p className='text-muted'>A simple note taking app</p>
      </div>
    );
  };

  const renderNotes = () => {
    return (
      <div className='notes'>
        <h2 className='pd-3 mt-4 mb-3 border-bottom'>Your Notes</h2>
        <ListGroup>{!isLoading && renderNoteList(notes)}</ListGroup>
      </div>
    );
  };

  return (
    <div className='home'>
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
};

export default Home;
