import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message.jsx';
import Loader from '../components/Loader.jsx';
import MoneyDisplay from '../components/MoneyDisplay.jsx';
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useDeliverOrderMutation,
} from '../slices/ordersApiSlice.js';
import useT from '../hooks/useT.js';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const tr = useT();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const simulatePayHandler = async () => {
    try {
      await payOrder({
        orderId,
        details: { id: `SIM-${Date.now()}`, status: 'COMPLETED' },
      }).unwrap();
      refetch();
      toast.success(tr('order.paid'));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      refetch();
      toast.success(tr('order.delivered'));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">{error?.data?.message || error.error}</Message>
    );

  return (
    <>
      <h1>
        {tr('order.title')} {order._id}
      </h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>{tr('placeorder.shipping')}</h2>
              <p>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  {tr('order.delivered')}: {order.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger">{tr('order.notDelivered')}</Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>{tr('placeorder.payment')}</h2>
              <p>{order.paymentMethod}</p>
              {order.isPaid ? (
                <Message variant="success">
                  {tr('order.paid')}: {order.paidAt}
                </Message>
              ) : (
                <Message variant="danger">{tr('order.notPaid')}</Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>{tr('placeorder.items')}</h2>
              {order.orderItems.map((item, index) => (
                <ListGroup.Item key={index}>
                  <Row className="align-items-center">
                    <Col md={1}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </Col>
                    <Col md={4}>
                      {item.qty} x <MoneyDisplay usd={item.price} />
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
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
                    <MoneyDisplay usd={order.itemsPrice} />
                  </Col>
                </Row>
                <Row>
                  <Col>{tr('placeorder.shippingPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={order.shippingPrice} />
                  </Col>
                </Row>
                <Row>
                  <Col>{tr('placeorder.taxPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={order.taxPrice} />
                  </Col>
                </Row>
                <Row>
                  <Col>{tr('placeorder.totalPrice')}</Col>
                  <Col>
                    <MoneyDisplay usd={order.totalPrice} />
                  </Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    onClick={simulatePayHandler}
                    disabled={loadingPay}
                  >
                    {tr('order.payNow')}
                  </Button>
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type="button"
                      className="btn btn-block"
                      onClick={deliverHandler}
                    >
                      {tr('order.markDelivered')}
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
