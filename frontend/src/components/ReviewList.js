import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaStar, FaUser, FaCalendar } from 'react-icons/fa';

const ReviewList = ({ productId, productRating, numReviews }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/api/reviews/product/${productId}`);
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Customer Reviews</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 mr-2">{productRating || 0}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        i < Math.floor(productRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm sm:text-base text-gray-600">
                {numReviews || 0} {numReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {review.user?.name || 'Anonymous User'}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base mb-2">{review.comment}</p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <FaCalendar className="mr-1" />
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
