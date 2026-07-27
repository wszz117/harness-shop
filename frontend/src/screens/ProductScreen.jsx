import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice.js';
import { addToCart } from '../slices/cartSlice.js';
import { selectLanguage } from '../slices/languageSlice.js';
import Rating from '../components/Rating.jsx';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';
import MoneyDisplay from '../components/MoneyDisplay.jsx';
import WishlistHeart from '../components/WishlistHeart.jsx';
import useT from '../hooks/useT.js';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lang = useSelector(selectLanguage);
  const tr = useT();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: product, isLoading, refetch, error } =
    useGetProductDetailsQuery({ productId, lang });
  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingReview }] =
    useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success(tr('product.reviewSubmitted'));
      setRating(0);
      setComment('');
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
      <Link className="btn btn-light my-3" to="/">
        {tr('product.goBack')}
      </Link>
      <Row>
        <Col md={5}>
          <Image src={product.image} alt={product.name} fluid />
        </Col>
        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <div className="d-flex justify-content-between">
                <h3 data-testid="product-name">{product.name}</h3>
                <WishlistHeart productId={product._id} />
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                value={product.rating}
                text={`${product.numReviews} ${tr('product.reviews')}`}
              />
            </ListGroup.Item>
            <ListGroup.Item>
              {tr('product.price')}: <MoneyDisplay usd={product.price} />
            </ListGroup.Item>
            <ListGroup.Item>{product.description}</ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>{tr('product.price')}:</Col>
                  <Col>
                    <strong>
                      <MoneyDisplay usd={product.price} />
                    </strong>
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>{tr('product.status')}:</Col>
                  <Col>
                    {product.countInStock > 0
                      ? tr('product.inStock')
                      : tr('product.outOfStock')}
                  </Col>
                </Row>
              </ListGroup.Item>
              {product.countInStock > 0 && (
                <ListGroup.Item>
                  <Row>
                    <Col>{tr('product.qty')}</Col>
                    <Col>
                      <Form.Control
                        as="select"
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                      >
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <Button
                  className="btn-block"
                  type="button"
                  disabled={product.countInStock === 0}
                  onClick={addToCartHandler}
                  data-testid="add-to-cart"
                >
                  {tr('product.addToCart')}
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Row className="review">
        <Col md={6}>
          <h2>{tr('product.reviews')}</h2>
          {product.reviews.length === 0 && (
            <Message>{tr('product.noReviews')}</Message>
          )}
          <ListGroup variant="flush">
            {product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating value={review.rating} />
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            ))}
            <ListGroup.Item>
              <h2>{tr('product.writeReview')}</h2>
              {userInfo ? (
                <Form onSubmit={submitReviewHandler}>
                  <Form.Group className="my-2" controlId="rating">
                    <Form.Label>{tr('product.rating.label')}</Form.Label>
                    <Form.Control
                      as="select"
                      required
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="">...</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="my-2" controlId="comment">
                    <Form.Label>{tr('product.comment.label')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      row="3"
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></Form.Control>
                  </Form.Group>
                  <Button
                    disabled={loadingReview}
                    type="submit"
                    variant="primary"
                  >
                    {tr('product.submit')}
                  </Button>
                </Form>
              ) : (
                <Message>
                  <Link to="/login">{tr('nav.signin')}</Link>
                </Message>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </>
  );
};

export default ProductScreen;
