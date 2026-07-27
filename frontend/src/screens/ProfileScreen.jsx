import { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message.jsx';
import Loader from '../components/Loader.jsx';
import { useProfileMutation } from '../slices/usersApiSlice.js';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';
import useT from '../hooks/useT.js';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const tr = useT();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.name]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await updateProfile({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>{tr('profile.title')}</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-2" controlId="name">
            <Form.Label>{tr('auth.name')}</Form.Label>
            <Form.Control
              type="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="email">
            <Form.Label>{tr('auth.email')}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="password">
            <Form.Label>{tr('auth.password')}</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="confirmPassword">
            <Form.Label>{tr('auth.confirmPassword')}</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Button type="submit" variant="primary">
            {tr('profile.update')}
          </Button>
          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
      <Col md={9}>
        <h2>{tr('profile.myOrders')}</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>{tr('profile.order.id')}</th>
                <th>{tr('profile.order.date')}</th>
                <th>{tr('profile.order.total')}</th>
                <th>{tr('profile.order.paid')}</th>
                <th>{tr('profile.order.delivered')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>${order.totalPrice}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <FaTimes
                        style={{ /* allow-style */ color: 'red' }}
                        aria-label={tr('order.notPaid')}
                        title={tr('order.notPaid')}
                      />
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <FaTimes
                        style={{ /* allow-style */ color: 'red' }}
                        aria-label={tr('order.notDelivered')}
                        title={tr('order.notDelivered')}
                      />
                    )}
                  </td>
                  <td>
                    <Button
                      className="btn-sm"
                      variant="light"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      {tr('profile.order.details')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
