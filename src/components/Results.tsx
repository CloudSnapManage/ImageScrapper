import React, { useContext } from "react";
import { ScraperContext, ScraperContextInterface } from "../context/ScraperContext";
import Gallery from "./Gallery";

import { extractPageUrl } from "../utils/dom";

import { useHistory } from 'react-router';
import { History } from 'history';
import { Button } from 'semantic-ui-react';
import JSZip from 'jszip';

type ResultsProp = {
  urlString: string
}

const Results = ({ urlString }: ResultsProp): JSX.Element => {

  const globalContext = useContext(ScraperContext) as ScraperContextInterface;
  const { pageTitle, images } : ScraperContextInterface = globalContext

  let history: History = useHistory();

  const downloadAllImages = async () => {
    if (!images || images.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder(pageTitle || 'images');

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const response = await fetch(img.src);
        if (!response.ok) continue;
        const blob = await response.blob();
        const filename = `image_${i + 1}.${blob.type.split('/')[1] || 'jpg'}`;
        folder?.file(filename, blob);
      } catch (error) {
        console.error(`Failed to download ${img.src}:`, error);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageTitle || 'scraped_images'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!pageTitle && urlString) {
    const pageUrl: string = extractPageUrl(urlString);
    history.push(`/scrape/image?page_url={${pageUrl}}`)
  }


  return (
    <div>
      { pageTitle && <h2>{pageTitle} Images</h2>  }
      { images && images.length > 0 && (
        <Button primary onClick={downloadAllImages}>
          Download All Images as ZIP
        </Button>
      )}
      <div className="photo-container">
        <Gallery data={images} />
      </div>
    </div>
  );
};

export default Results;