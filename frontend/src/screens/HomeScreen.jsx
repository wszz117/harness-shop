import { Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProductsQuery } from '../slices/productsApiSlice.js';
import { selectLanguage } from '../slices/languageSlice.js';
import Product from '../components/Product.jsx';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';
import Paginate from '../components/Paginate.jsx';
import useT from '../hooks/useT.js';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const lang = useSelector(selectLanguage);
  const tr = useT();
  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
    lang,
  });

  return (
    <>
      {keyword && (
        <Link to="/" className="btn btn-light mb-4">
          {tr('home.back')}
        </Link>
      )}
      <h1 data-testid="page-main-title" className="pageMainTitle">
        {tr('home.title')}
      </h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate pages={data.pages} page={data.page} keyword={keyword ?? ''} />
        </>
      )}
    </>
  );
};

export default HomeScreen;
