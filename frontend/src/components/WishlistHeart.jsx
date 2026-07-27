import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../slices/usersApiSlice.js';
import useT from '../hooks/useT.js';

// 商品卡片/详情红心 —— 列表+详情+独立页展示一致 (specs/wishlist.md)
const WishlistHeart = ({ productId }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const tr = useT();
  const { data: wishlist } = useGetWishlistQuery(undefined, {
    skip: !userInfo,
  });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isFav = Boolean(
    wishlist && wishlist.some((p) => p._id === productId)
  );

  const toggle = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        await removeFromWishlist(productId).unwrap();
      } else {
        await addToWishlist(productId).unwrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <span
      role="button"
      onClick={toggle}
      data-testid={`wishlist-heart-${productId}`}
      title={isFav ? tr('wishlist.remove') : tr('wishlist.add')}
      style={{ /* allow-style */ color: '#e94560', cursor: 'pointer' }}
    >
      {isFav ? <FaHeart /> : <FaRegHeart />}
    </span>
  );
};

export default WishlistHeart;
