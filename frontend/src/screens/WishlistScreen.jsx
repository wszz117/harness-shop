import { Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../slices/usersApiSlice.js';
import { addToCart } from '../slices/cartSlice.js';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';
import MoneyDisplay from '../components/MoneyDisplay.jsx';
import useT from '../hooks/useT.js';

// 独立收藏页 /wishlist —— 我的收藏 / My Favorites (specs/wishlist.md)
const WishlistScreen = () => {
  const { data: wishlist, isLoading, error } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tr = useT();

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    navigate('/cart');
  };

  return (
    <>
      <h1 data-testid="wishlist-title">{tr('wishlist.title')}</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : wishlist.length === 0 ? (
        <Message>
          {tr('wishlist.empty')}{' '}
          <Link to="/" data-testid="wishlist-back-home">
            {tr('wishlist.backHome')}
          </Link>
        </Message>
      ) : (
        <>
          <Row>
            {wishlist.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Card className="my-3 p-3 rounded" data-testid="wishlist-card">
                  <Link to={`/product/${product._id}`}>
                    <Card.Img src={product.image} variant="top" />
                  </Link>
                  <Card.Body>
                    <Link to={`/product/${product._id}`}>
                      <Card.Title as="div" className="product-title">
                        <strong>{product.name}</strong>
                      </Card.Title>
                    </Link>
                    <Card.Text as="h5">
                      <MoneyDisplay usd={product.price} />
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        disabled={product.countInStock === 0}
                        onClick={() => addToCartHandler(product)}
                      >
                        {tr('wishlist.addToCart')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => removeFromWishlist(product._id)}
                      >
                        {tr('wishlist.remove')}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Link to="/" className="btn btn-light mt-3">
            {tr('wishlist.backHome')}
          </Link>
        </>
      )}
    </>
  );
};

export default WishlistScreen;
