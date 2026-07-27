import { Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  const navigate = useNavigate();
  if (pages <= 1) return null;

  const pathFor = (p) =>
    !isAdmin
      ? keyword
        ? `/search/${keyword}/page/${p}`
        : `/page/${p}`
      : `/admin/productlist/${p}`;

  return (
    <Pagination>
      {[...Array(pages).keys()].map((x) => (
        <Pagination.Item
          key={x + 1}
          active={x + 1 === page}
          onClick={() => navigate(pathFor(x + 1))}
        >
          {x + 1}
        </Pagination.Item>
      ))}
    </Pagination>
  );
};

export default Paginate;
