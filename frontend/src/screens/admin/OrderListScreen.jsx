import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Message from '../../components/Message.jsx';
import Loader from '../../components/Loader.jsx';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice.js';
import useT from '../../hooks/useT.js';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const navigate = useNavigate();
  const tr = useT();

  return (
    <>
      <h1>{tr('admin.orders.title')}</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.name}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>${order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    order.paidAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ /* allow-style */ color: 'red' }} />
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    order.deliveredAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ /* allow-style */ color: 'red' }} />
                  )}
                </td>
                <td>
                  <Button
                    variant="light"
                    className="btn-sm"
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
    </>
  );
};

export default OrderListScreen;
