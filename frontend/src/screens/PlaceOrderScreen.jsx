import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps.jsx';
import Message from '../components/Message.jsx';
import Loader from '../components/Loader.jsx';
import MoneyDisplay from '../components/MoneyDisplay.jsx';
import { useCreateOrderMutation } from '../slices/ordersApiSlice.js';
import { clearCartItems } from '../slices/cartSlice.js';
import useT from '../hooks/useT.js';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const tr = useT();

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>{tr('placeorder.shipping')}</h2>
              <p>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>{tr('placeorder.payment')}</h2>
              {cart.paymentMethod}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>{tr('placeorder.items')}</h2>
              {cart.cartItems.length === 0 ? (
                <Message>{tr('cart.empty')}</Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row className="align-items-center">
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item._id}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x <MoneyDisplay usd={item.price} />
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>{tr('placeorder.summary')}</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{tr('placeorder.itemsPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={cart.itemsPrice} />
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{tr('placeorder.shippingPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={cart.shippingPrice} />
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{tr('placeorder.taxPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={cart.taxPrice} />
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{tr('placeorder.totalPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={cart.totalPrice} />
                  </Col>
                </Row>
              </ListGroup.Item>
              {error && (
                <ListGroup.Item>
                  <Message variant="danger">
                    {error?.data?.message || error.error}
                  </Message>
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <Button
                  type="button"
                  className="btn-block"
                  disabled={cart.cartItems.length === 0}
                  onClick={placeOrderHandler}
                >
                  {tr('placeorder.submit')}
                </Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
