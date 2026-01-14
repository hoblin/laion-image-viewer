> **ARCHIVED - NO LONGER FUNCTIONAL**
>
> This application relied on LAION's public CLIP retrieval API at `knn.laion.ai`, which was taken offline on December 19, 2023 following the discovery of CSAM in the LAION-5B dataset by Stanford Internet Observatory. The API has not been restored and LAION has not announced plans to do so.
>
> For more information, see [LAION's statement on Re-LAION-5B](https://laion.ai/blog/relaion-5b/).

---

# LAION-5B CLIP-Retrieval Interface

This application serves as an interface to the CLIP-retrieval API of the LAION-5B dataset. LAION-5B is a large-scale dataset consisting of 5.85 billion CLIP-filtered image-text pairs, designed for research purposes. This interface allows users to search the dataset using text queries, which are converted to CLIP embeddings and used to query a k-nearest neighbors (knn) index of CLIP image embeddings.

The application is built with React and Ant Design, and uses the `react-virtuoso` library for efficient rendering of large lists of images, and the `axios` library for making HTTP requests.

## Features

- Convert text queries to CLIP embeddings and query the LAION-5B dataset
- Display images in a grid with their captions and sizes
- Efficiently load and render a large number of images
- Preload images for smoother user experience

## How it works

The application sends a POST request to the `https://knn.laion.ai/knn-service` endpoint with the search query to get a list of image IDs. It then sends another POST request to the `https://knn.laion.ai//metadata` endpoint with a batch of image IDs to get the image metadata, which includes the image URLs and captions.

The images are grouped into batches of six and rendered in a grid using the `Virtuoso` component from the `react-virtuoso` library. The `Virtuoso` component efficiently handles the rendering of the large list of images, only rendering the images that are currently in view and a small number of images outside of the view for smoother scrolling.

When an image is loaded, its size is determined and displayed along with the image.

## Installation

1. Clone this repository
2. Install the dependencies with `npm install`
3. Start the application with `npm start`

## Deployment

The application can be deployed to GitHub Pages by running `npm run deploy`.

## License

This project is licensed under the MIT License.
