import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer.jsx';
import Loader from '../components/Loader.jsx';
import { useLoginMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';
import useT from '../hooks/useT.js';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const tr = useT();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>{tr('auth.signin')}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="email">
          <Form.Label>{tr('auth.email')}</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="login-email"
          ></Form.Control>
        </Form.Group>
        <Form.Group className="my-2" controlId="password">
          <Form.Label>{tr('auth.password')}</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="login-password"
          ></Form.Control>
        </Form.Group>
        <Button
          disabled={isLoading}
          type="submit"
          variant="primary"
          className="mt-2"
          data-testid="login-submit"
        >
          {tr('auth.signin')}
        </Button>
        {isLoading && <Loader />}
      </Form>
      <Row className="py-3">
        <Col>
          {tr('auth.newCustomer')}{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            {tr('auth.register')}
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
