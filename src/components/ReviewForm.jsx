import React, { useState } from 'react';
import { FiStar, FiUpload } from 'react-icons/fi';
import api from '../api/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onReviewAdded, user }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to write a review");
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                productId,
                firebaseUid: user.uid,
                rating,
                comment,
                images: imageUrl ? [imageUrl] : []
            });
            toast.success("Review Submitted!");
            setComment('');
            setImageUrl('');
            setRating(5);
            if (onReviewAdded) onReviewAdded();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-form" style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3>Write a Review</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                                key={star}
                                size={24}
                                fill={star <= rating ? "#fcd200" : "none"}
                                color={star <= rating ? "#fcd200" : "#ccc"}
                                onClick={() => setRating(star)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Comment</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        rows="4"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Image URL (Optional)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ background: '#000', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
