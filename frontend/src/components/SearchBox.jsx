import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import useT from '../hooks/useT.js';

const SearchBox = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();
  const [keyword, setKeyword] = useState(urlKeyword || '');
  const tr = useT();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setKeyword('');
      navigate(`/search/${keyword.trim()}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Form onSubmit={submitHandler} className="d-flex">
      <Form.Control
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder={tr('nav.search.placeholder')}
        className="mr-sm-2 ml-sm-5"
        data-testid="search-input"
      />
      <Button
        type="submit"
        variant="outline-success"
        className="p-2 mx-2"
        data-testid="search-button"
      >
        {tr('nav.search.button')}
      </Button>
    </Form>
  );
};

export default SearchBox;
