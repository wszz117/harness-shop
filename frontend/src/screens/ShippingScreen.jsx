import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer.jsx';
import CheckoutSteps from '../components/CheckoutSteps.jsx';
import { saveShippingAddress } from '../slices/cartSlice.js';
import useT from '../hooks/useT.js';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;
  const tr = useT();

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>{tr('shipping.title')}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="address">
          <Form.Label>{tr('shipping.address')}</Form.Label>
          <Form.Control
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group className="my-2" controlId="city">
          <Form.Label>{tr('shipping.city')}</Form.Label>
          <Form.Control
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group className="my-2" controlId="postalCode">
          <Form.Label>{tr('shipping.postalCode')}</Form.Label>
          <Form.Control
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group className="my-2" controlId="country">
          <Form.Label>{tr('shipping.country')}</Form.Label>
          <Form.Control
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-2">
          {tr('shipping.continue')}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingScreen;
