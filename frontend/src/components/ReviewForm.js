import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ReviewForm = ({ productId, onReviewSubmit, onReviewUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && productId) {
      fetchUserReview();
    }
  }, [isAuthenticated, productId]);

  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get(`/api/reviews/product/${productId}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data) {
        setUserReview(data);
        setRating(data.rating);
        setComment(data.comment);
      }
    } catch (error) {
      // User hasn't reviewed this product yet
      setUserReview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/api/reviews', {
        productId,
        rating,
        comment: comment.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userReview) {
        // Update existing review
        setUserReview(data.review);
        onReviewUpdate && onReviewUpdate(data.productRating, data.numReviews);
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        setUserReview(data.review);
        onReviewSubmit && onReviewSubmit(data.productRating, data.numReviews);
        toast.success('Review submitted successfully!');
      }

      setEditing(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/reviews/${userReview._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserReview(null);
      setRating(0);
      setComment('');
      onReviewUpdate && onReviewUpdate(0, 0);
      toast.success('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setRating(0);
      setComment('');
    }
    setEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      {!isAuthenticated ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Please login to write a review</p>
          <Link
            to="/login"
            className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
        </div>
      ) : userReview && !editing ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-medium text-gray-900">Your Rating:</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Edit review"
              >
                <FaEdit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete review"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-700 text-sm sm:text-base">{userReview.comment}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none"
                >
                  <FaStar
                    className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors ${
                      star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Click to rate from 1 to 5 stars
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base"
              placeholder="Share your experience with this product..."
              required
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting || !rating || !comment.trim()}
              className="flex-1 bg-primary-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
            >
              {submitting ? 'Submitting...' : editing ? 'Update Review' : 'Submit Review'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
