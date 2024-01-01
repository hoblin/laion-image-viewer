import React, { useState, useEffect } from "react";
import axios from "axios";
import { Virtuoso } from "react-virtuoso";
import {
  message,
  ConfigProvider,
  Input,
  Image,
  Layout,
  Row,
  Col,
  Card,
  Tooltip,
  Empty,
} from "antd";
import "./App.css";

import theme from "./theme";

const { Header, Content } = Layout;

const imagesTotal = 6000;

function App() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [ids, setIds] = useState([]);

  const groupBySix = (data) => {
    return data.reduce((acc, curr, i) => {
      if (i % 6 === 0) acc.push([curr]);
      else acc[acc.length - 1].push(curr);
      return acc;
    }, []);
  };

  const fetchImages = async () => {
    try {
      if (search !== "") {
        if (ids.length === 0) {
          const result = await axios.post("https://knn.laion.ai/knn-service", {
            num_images: 48,
            num_result_ids: imagesTotal,
            modality: "image",
            indice_name: "laion5B-H-14",
            text: search,
            deduplicate: true,
            use_safety_model: false,
            use_violence_detector: false,
          });

          const images = groupBySix(result.data.slice(0, 48));
          const remainingIds = result.data.slice(48).map((item) => item.id);
          setData(images);
          setIds(remainingIds);
        } else {
          const nextBatchIds = ids.slice(0, 48);
          const remainingIds = ids.slice(48);
          const result = await axios.post("https://knn.laion.ai/metadata", {
            ids: nextBatchIds,
            indice_name: "laion5B-H-14",
          });
          const newImages = groupBySix(
            result.data.map((item) => item.metadata)
          );

          // Preload images
          newImages.flat().forEach((img) => {
            new window.Image().src = img.url;
          });

          setData((oldData) => [...oldData, ...newImages]);
          setIds(remainingIds);
        }
      }
    } catch (error) {
      message.error(`An error occurred: ${error.message}`);
    }
  };

  const handleSearch = (value) => {
    setIds([]);
    setData([]);
    setSearch(value);
  };

  useEffect(() => {
    fetchImages();
  }, [search]);

  const ImageComponent = ({ img }) => {
    const [size, setSize] = useState(null);

    const handleImageLoad = ({ target: img }) => {
      setSize({ width: img.naturalWidth, height: img.naturalHeight });
    };

    return (
      <Card
        cover={
          <Image
            src={img.url}
            placeholder
            preview={{ mask: false }}
            onLoad={handleImageLoad}
          />
        }
        title={
          size && (
            <p>
              Size: {size.width}x{size.height}
            </p>
          )
        }
      >
        <Card.Meta
          description={
            <>
              <Tooltip title={img.caption}>{img.caption}</Tooltip>
            </>
          }
        />
      </Card>
    );
  };

  const renderItem = (index, item) => {
    return (
      <Row key={index}>
        {item.map((img, i) => (
          <Col span={4} key={i}>
            <Card cover={<ImageComponent img={img} />}>
              <Card.Meta
                description={
                  <Tooltip title={img.caption}>{img.caption}</Tooltip>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <ConfigProvider theme={{ ...theme }}>
      <Layout className="layout">
        <Header>
          <Input.Search
            placeholder="Search for images"
            onSearch={handleSearch}
            allowClear
          />
        </Header>
        <Content style={{ height: "calc(100vh - 64px)" }}>
          <Image.PreviewGroup>
            {data.length === 0 ? (
              <Empty description="Enter a search term and hit Enter to load images" />
            ) : (
              <Virtuoso
                data={data}
                endReached={fetchImages}
                style={{ height: "100%" }}
                itemContent={renderItem}
                overscan={3}
                totalCount={imagesTotal}
              />
            )}
          </Image.PreviewGroup>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
