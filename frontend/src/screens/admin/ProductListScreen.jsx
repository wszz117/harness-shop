import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message.jsx';
import Loader from '../../components/Loader.jsx';
import Paginate from '../../components/Paginate.jsx';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from '../../slices/productsApiSlice.js';
import useT from '../../hooks/useT.js';

const ProductListScreen = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const tr = useT();

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    pageNumber,
  });

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();
  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteProduct(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    try {
      await createProduct();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>{tr('admin.products.title')}</h1>
        </Col>
        <Col className="text-end">
          <Button className="my-3" onClick={createProductHandler}>
            <FaPlus /> {tr('admin.products.create')}
          </Button>
        </Col>
      </Row>
      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    <Button
                      variant="light"
                      className="btn-sm mx-2"
                      onClick={() =>
                        navigate(`/admin/product/${product._id}/edit`)
                      }
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash style={{ /* allow-style */ color: 'white' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </>
  );
};

export default ProductListScreen;
