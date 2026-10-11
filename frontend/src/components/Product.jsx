import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating.jsx';
import MoneyDisplay from './MoneyDisplay.jsx';
import WishlistHeart from './WishlistHeart.jsx';
import useT from '../hooks/useT.js';

const Product = ({ product }) => {
  const tr = useT();
  return (
    <Card className="my-3 p-3 rounded" data-testid="product-card">
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} variant="top" alt={product.name} />
      </Link>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <Link to={`/product/${product._id}`} className="product-title-link">
            <Card.Title as="div" className="product-title">
              <strong>{product.name}</strong>
            </Card.Title>
          </Link>
          <WishlistHeart productId={product._id} />
        </div>
        <Card.Text as="div">
          <Rating
            value={product.rating}
            text={`${product.numReviews} ${tr('product.reviews')}`}
          />
        </Card.Text>
        <Card.Text as="h3">
          <MoneyDisplay usd={product.price} />
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;
