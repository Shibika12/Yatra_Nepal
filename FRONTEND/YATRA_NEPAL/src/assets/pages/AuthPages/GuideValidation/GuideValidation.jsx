import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './guideValidation.scss';

const GuideValidation = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState({
        idProof: null,
        certificate: null,
        license: null
    });
    const [loading, setLoading] = useState(false);

    // Check if the user is logged in (tempGuideId should exist)
    useEffect(() => {
        if (!localStorage.getItem('tempGuideId')) {
            navigate('/login'); // Redirect to login if tempGuideId is not present
        }
    }, [navigate]);

    const handleFileChange = (e, docType) => {
        setDocuments({
            ...documents,
            [docType]: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('idProof', documents.idProof);
        formData.append('certificate', documents.certificate);
        formData.append('license', documents.license);
        formData.append('userId', localStorage.getItem('tempGuideId'));

        try {
            const response = await axios.post(
                'http://localhost:3002/auth/guide-documents',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                alert('Documents uploaded successfully! Your account is pending verification.');
                localStorage.removeItem('tempGuideId');
                navigate('/login');
            }
        } catch (error) {
            alert('Error uploading documents. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="guide-validation-container">
            <h2>Tour Guide Document Validation</h2>
            <p>Please upload the following documents to verify your account:</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Government ID Proof</label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'idProof')}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Tourism Related Certificates</label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'certificate')}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Tour Guide License (if available)</label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'license')}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Submit Documents'}
                </button>
            </form>
        </div>
    );
};

export default GuideValidation;
