export const CSS = `
  .deco-post-preview{
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  @media (min-width: 640px){
    .deco-post-preview{
      max-width: 640px
    }
  }
  
  @media (min-width: 768px){
    .deco-post-preview{
      max-width: 768px
    }
  }

  .deco-post-preview {
    font-family: 'Albert sans', sans-serif;
    color: #66736C;
  }
  
  .deco-post-preview p {
    line-height: 1.75rem;
    margin-bottom: 1rem;
  }

  .deco-post-preview h1,
  .deco-post-preview h2,
  .deco-post-preview h3,
  .deco-post-preview h4,
  .deco-post-preview h5,
  .deco-post-preview h6 {
      color: #161616;
  }
  
  .deco-post-preview h1 {
    font-size: 2.25rem;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    line-height: 2.5rem;
  }
  
  .deco-post-preview h2 {
    font-size: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    line-height: 2rem;
  }
  
  .deco-post-preview h3 {
    font-size: 1.25rem;
    margin-top: 1.75rem;
    margin-bottom: 0.5rem;
    line-height: 1.75rem;
  }
  
  .deco-post-preview h4 {
    font-size: 1rem;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.5rem;
  }
  
  .deco-post-preview h5 {
    font-size: 0.875rem;
    margin-top: 1.25rem;
    margin-bottom: 0.25rem;
    line-height: 1.25rem;
  }
  
  .deco-post-preview h6 {
    font-size: 0.75rem;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    line-height: 1rem;
  }
  
  .deco-post-preview time,
  .deco-post-preview address {
    font-size: 0.875rem;
    color: #555;
  }
  
  .deco-post-preview a[rel="tag"] {
    background-color: #f0f0f0;
    color: #333;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .deco-post-preview a {
    color: #007bff;
    text-decoration: none;
  }
  
  .deco-post-preview a:hover {
    color: #0056b3;
  }
  
  .deco-post-preview pre {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 0.25rem;
    overflow-x: auto;
  }
  
  .deco-post-preview code {
    font-family: 'Courier New', monospace;
    background-color: #f4f4f4;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .deco-post-preview ul,
  .deco-post-preview ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .decopost-preview ul {
    list-style-type: disc;
  }

  .deco-post-preview ol {
      list-style-type: decimal;
  }
  
  .deco-post-preview li {
    margin-bottom: 0.25rem;
  }
  
  .deco-post-preview blockquote {
    font-style: italic;
    overflow: hidden;
    padding-left: 1rem;
    color: #555;
    border-left: 4px solid #ddd;
    margin: 0 0 1rem;
    line-height: 1.75rem;
  }
  
  .deco-post-preview img {
    max-width: 100%;
    height: auto;
    margin-bottom: 1rem;
  }
  
  .deco-post-preview table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .deco-post-preview th,
  .deco-post-preview td {
    text-align: left;
    padding: 0.5rem;
    border: 1px solid #ddd;
  }
  
  .deco-post-preview th {
    background-color: #f4f4f4;
  }
  
  .deco-post-preview hr {
    border: 0;
    height: 1px;
    background: #e1e1e1;
    margin-bottom: 1rem;
  }
  
`;
