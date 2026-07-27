import { useState, useEffect } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer.jsx';
import CheckoutSteps from '../components/CheckoutSteps.jsx';
import { savePaymentMethod } from '../slices/cartSlice.js';
import useT from '../hooks/useT.js';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tr = useT();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>{tr('payment.title')}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">{tr('payment.select')}</Form.Label>
          <Col>
            <Form.Check
              className="my-2"
              type="radio"
              label="PayPal"
              id="PayPal"
              name="paymentMethod"
              value="PayPal"
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </Col>
        </Form.Group>
        <Button type="submit" variant="primary">
          {tr('shipping.continue')}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
