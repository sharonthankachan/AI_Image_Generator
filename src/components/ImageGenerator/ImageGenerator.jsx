import React, { useRef, useState } from 'react';
import d_img from '../assets/default_img.avif';
import './ImageGenerator.css';

const api_key = import.meta.env.VITE_OPENAI_API_KEY

export default function ImageGenerator() {
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState(d_img);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
console.log(api_key);
 

  const imgGenerator = async () => {
    const prompt = inputRef.current.value.trim();
    if (prompt === "") {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${api_key}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "512x512",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "billing_hard_limit_reached") {
          setError("Billing limit reached. Please check your OpenAI account.");
        } else {
          setError(`Failed to fetch image generation: ${errorData.message}`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      const data_array = data.data;

      if (!data_array || data_array.length === 0) {
        setError("Empty or undefined data array received");
        setLoading(false);
        return;
      }

      setImgUrl(data_array[0].url);
    } catch (error) {
      setError(`Error generating image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-image-generator">
      <div className="header">
        AI IMAGE <span>GENERATOR</span>
      </div>
      <div className="img-loading">
        <div className="image">
          <img src={imgUrl} alt="AI Generated" />
        </div>
        <div className="loading">
          <div className={loading ? "loading-bar-full" : "loading-bar"}></div>
          <div className={loading ? "loading-text" : "display-none"}>Loading...</div>
        </div>
      </div>
      <div className="searchbar">
        <input
          id="my_input"
          type="text"
          ref={inputRef}
          className="search-input"
          placeholder="Describe What You Want To See"
          onKeyUp={(event) => { if (event.key === 'Enter') imgGenerator(); }}
        />
        <div className="generate-btn" onClick={imgGenerator}>Generate</div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
