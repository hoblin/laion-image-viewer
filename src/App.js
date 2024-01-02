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
  Button,
  Popover,
  Typography,
  Space,
  Flex,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import ReactGA from "react-ga4";

import { fallbackImage } from "./constants";
import "./App.css";

import theme from "./theme";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const imagesTotal = 10000;
const perPage = 300;
const timeOut = 1000;
const preloadOffset = 2000;

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
};

function App() {
  const windowWidth = useWindowWidth();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minDimensions, setMinDimensions] = useState({
    width: 500,
    height: 500,
  });

  const getColumns = () => {
    if (windowWidth <= 576) {
      return 1; // One column for xs screens
    } else if (windowWidth <= 768) {
      return 2; // Two columns for sm screens
    } else if (windowWidth <= 1024) {
      return 4; // Two columns for sm screens
    } else if (windowWidth < 3840) {
      return 6; // Two columns for sm screens
    } else {
      return 12; // Six columns for md screens and up
    }
  };

  const groupByColumns = (data) => {
    const columns = getColumns();
    return data.reduce((acc, curr, i) => {
      if (i % columns === 0) acc.push([curr]);
      else acc[acc.length - 1].push(curr);
      return acc;
    }, []);
  };

  const preloadImages = async (images) => {
    const loadedImages = await Promise.all(
      images.map((img) => {
        return new Promise((resolve) => {
          const image = new window.Image();
          image.onload = () =>
            resolve(
              image.naturalWidth >= minDimensions.width &&
                image.naturalHeight >= minDimensions.height
                ? {
                    ...img,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  }
                : null
            );
          image.onerror = () => resolve(null); // Ignore errors
          image.src = img.url;

          // Resolve the promise with null after the timeout, even if the image hasn't loaded
          setTimeout(() => resolve(null), timeOut);
        });
      })
    );

    return loadedImages.filter(Boolean); // Remove null values
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      if (search !== "") {
        if (ids.length === 0) {
          const result = await axios.post("https://knn.laion.ai/knn-service", {
            num_images: perPage,
            num_result_ids: imagesTotal,
            modality: "image",
            indice_name: "laion5B-H-14",
            text: search,
            deduplicate: true,
            use_safety_model: false,
            use_violence_detector: false,
          });

          const images = await preloadImages(result.data.slice(0, perPage));
          const remainingIds = result.data
            .slice(perPage)
            .map((item) => item.id);

          // Trigger next batch if all images was filtered out
          if (images.length === 0) {
            setIds(remainingIds);
            fetchImages();
          } else {
            setData(groupByColumns(images));
            setIds(remainingIds);
          }
        } else {
          const nextBatchIds = ids.slice(0, perPage);
          const remainingIds = ids.slice(perPage);
          const result = await axios.post("https://knn.laion.ai/metadata", {
            ids: nextBatchIds,
            indice_name: "laion5B-H-14",
          });
          const newImages = await preloadImages(
            result.data.map((item) => item.metadata)
          );

          setData(groupByColumns([...data.flat(), ...newImages]));
          setIds(remainingIds);
        }
      }
    } catch (error) {
      message.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setIds([]);
    setData([]);
    setSearch(value);
  };

  useEffect(() => {
    ReactGA.initialize("G-9B0GPT2XKD");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    const groupedData = groupByColumns(data.flat());
    setData(groupedData);
  }, [windowWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Blur the active element to hide the keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
    ReactGA.event({
      category: "Search",
      action: `Search for ${search}`,
    });
    fetchImages();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const ImageComponent = ({ img }) => {
    return (
      <Card
        style={{ flex: 1 }}
        cover={
          <Image
            src={img.url}
            placeholder
            preview={{ mask: false }}
            fallback={fallbackImage}
          />
        }
        title={`Size: ${img.width}x${img.height}`}
      >
        <Card.Meta
          description={<Tooltip title={img.caption}>{img.caption}</Tooltip>}
        />
      </Card>
    );
  };

  const renderItem = (index, item) => {
    return (
      <Row key={index} gutter={[16, 16]} style={{ margin: "8px" }}>
        {item.map((img, i) => (
          <Col
            span={24 / getColumns()}
            key={i}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <ImageComponent img={img} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <ConfigProvider theme={{ ...theme }}>
      <Layout className="layout">
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Popover
            content={
              <Space direction="vertical" style={{ width: "200px" }}>
                <Title level={5}>Minimum size</Title>
                <Flex align="center" justify="space-between">
                  <Text>Width</Text>
                  <Input
                    style={{ width: "5em" }}
                    type="number"
                    value={minDimensions.width}
                    onChange={(e) =>
                      setMinDimensions({
                        ...minDimensions,
                        width: e.target.value,
                      })
                    }
                  />
                </Flex>
                <Flex align="center" justify="space-between">
                  <Text>Height</Text>
                  <Input
                    style={{ width: "5em" }}
                    type="number"
                    value={minDimensions.height}
                    onChange={(e) =>
                      setMinDimensions({
                        ...minDimensions,
                        height: e.target.value,
                      })
                    }
                  />
                </Flex>
              </Space>
            }
            title="Filters"
            trigger="click"
            placement="bottomRight"
          >
            <Button
              style={{ marginRight: "16px" }}
              icon={<SettingOutlined />}
            />
          </Popover>
          <Input.Search
            placeholder="Search for images"
            onSearch={handleSearch}
            allowClear
            loading={loading}
          />
        </Header>
      </Layout>
      <Layout>
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
                totalCount={imagesTotal}
                overscan={4}
                atBottomThreshold={preloadOffset}
              />
            )}
          </Image.PreviewGroup>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
