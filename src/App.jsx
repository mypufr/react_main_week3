import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";

function App() {
  const [hasAccess, setHasAccess] = useState(false);

  const [products, setProducts] = useState([]);

  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });

  const defaultModalState = {
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: [""],
  };

  const [tempProduct, setTempProduct] = useState(defaultModalState);

  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const getProducts = async () => {
    try {
      const getProductsRes = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v2/api/${
          import.meta.env.VITE_API_PATH
        }/admin/products`
      );
      setProducts(getProductsRes.data.products);
    } catch (error) {
      console.dir(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v2/admin/signin`,
        account
      );
      // The data object returned from the server, which typically contains information about the authenticated session.
      // extracting the response of token and the expiration time of token
      const { token, expired } = loginRes.data;
      console.log(token, expired);
      document.cookie = `myToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common["Authorization"] = token;

      getProducts();
      setHasAccess(true);
      alert("登入成功");
    } catch (error) {
      alert("登入失敗，請重新登入");
      console.dir(error);
    }
  };

  const handleLoginCheck = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/v2/api/user/check`);
      getProducts();
      setHasAccess(true);
    } catch (error) {
      console.dir(error);
      alert("使用者未登入");
    }
  };

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    // Axios's global configuration that allows you to set headers that will be included with every API request.
    axios.defaults.headers.common["Authorization"] = token;
    handleLoginCheck();
  }, []);

  const productModalRef = useRef(null);

  const deleteProductModalRef = useRef(null);

  //設定是否啟用
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    // 渲染之後建立模態框實例，並將 productModalRef.current（即 DOM 元素）與模態框功能綁定。Bootstrap 會將該 DOM 元素轉換為一個可以使用的模態框。
    new Modal(productModalRef.current, { backdrop: false });

    // Bootstrap 提供的方法，用於檢查某個 DOM 元素是否已經關聯了一個模態框實例。如果該 DOM 元素已經關聯了一個模態框實例，這裡會返回實例物件。如果還未關聯模態框實例，可能返回 null。
    Modal.getInstance(productModalRef.current);

    // 建立模態框實例，並將 deleteProductModalRef.current與模態框功能綁定
    new Modal(deleteProductModalRef.current, { backdrop: false });
    Modal.getInstance(deleteProductModalRef.current);

    // console.log(Modal.getInstance(productModalRef.current));
  }, []);

  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode);

    switch (mode) {
      case "create":
        setTempProduct(defaultModalState);
        break;
      case "edit":
        setTempProduct(product);
        break;
      default:
        break;
    }

    const modalInstance = Modal.getInstance(productModalRef.current);

    modalInstance.show();
  };

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);

    modalInstance.hide();
  };

  // 開啟刪除產品Modal
  const handleOpenDeleteProductModal = (product) => {
    setTempProduct(product);

    const modalInstance = Modal.getInstance(deleteProductModalRef.current);

    modalInstance.show();
  };

  // 關閉刪除產品Modal
  const handleCloseDeleteProductModal = () => {
    const modalInstance = Modal.getInstance(deleteProductModalRef.current);

    modalInstance.hide();
  };

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;

    setTempProduct({
      ...tempProduct,
      // input type若是checkbox，就綁定在checked屬性上做true或false狀態的改變
      [name]: type === "checkbox" ? checked : value,
    });

    console.log(tempProduct);
  };

  const handleImageChange = (e, index) => {
    const { value } = e.target;
    console.log(value, index);

    const newImages = [...tempProduct.imagesUrl];
    // 使用當前的陣列index值來增加新的input值
    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });

    console.log(newImages);
  };

  const handleAddImage = () => {
    const newImages = [...tempProduct.imagesUrl, ""];

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });

    console.log(tempProduct);
  };

  const handleDeleteImage = () => {
    const updatedImages = [...tempProduct.imagesUrl];
    updatedImages.pop();
    setTempProduct({
      ...tempProduct,
      imagesUrl: updatedImages,
    });
  };

  //串接新增產品的API
  const addNewProduct = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v2/api/${
          import.meta.env.VITE_API_PATH
        }/admin/product`,
        {
          data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0,
          },
        }
      );
    } catch (error) {
      console.log(error);
      alert("新增失敗!");
    }
  };

  //串接更新產品的API
  const updateProduct = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v2/api/${
          import.meta.env.VITE_API_PATH
        }/admin/product/${tempProduct.id}`,
        {
          data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0,
          },
        }
      );
    } catch (error) {
      console.log(error);
      alert("更新失敗!");
    }
  };

  // 點選"確認"按鈕後的運作
  const handleUpdateProduct = async () => {
    const apiOption = modalMode === "create" ? addNewProduct : updateProduct;
    try {
      await apiOption(); // 確保產品新增完成
      getProducts(); // 異步更新產品列表，不需等待
      handleCloseProductModal(); //不需要等待 getProducts() 完成即可關閉 Modal，所以不需要 await
    } catch (error) {
      console.log(error);
      alert("更新失敗!");
    }
  };

  //串接刪除產品的API
  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/v2/api/${
          import.meta.env.VITE_API_PATH
        }/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      console.log(error);
      alert("刪除失敗!");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProducts();
      handleCloseDeleteProductModal();
    } catch (error) {
      console.log(error);
      alert("刪除失敗!");
    }
  };

  return (
    <>
      {hasAccess ? (
        <>
          <div className="container py-5">
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-between">
                  <h2>產品列表</h2>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleOpenProductModal("create")}
                  >
                    建立新的產品
                  </button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">產品名稱</th>
                      <th scope="col">原價</th>
                      <th scope="col">售價</th>
                      <th scope="col">是否啟用</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <th scope="row">{product.title}</th>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>
                          {product.is_enabled ? (
                            <span className="text-success">啟用</span>
                          ) : (
                            <span className="text-danger">未啟用</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleOpenProductModal("edit", product)
                              }
                            >
                              編輯
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleOpenDeleteProductModal(product)
                              }
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                type="email"
                name="username"
                value={account.username}
                className="form-control"
                id="username"
                placeholder="name@example.com"
                onChange={handleInputChange}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                name="password"
                value={account.password}
                className="form-control"
                id="password"
                placeholder="Password"
                onChange={handleInputChange}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>
              登入
            </button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
      {/* 新增產品或編輯產品的Modal */}
      <div
        ref={productModalRef}
        id="productModal"
        className="modal"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">
                {modalMode === "create" ? "新增產品" : "編輯產品"}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseProductModal}
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                      onChange={handleModalInputChange}
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image} // 綁定
                          onChange={(e) => handleImageChange(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}

                    {/* 設定顯示條件：欄位資料不超過5筆資料，且最後一筆資料不是空字串 */}
                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[
                          tempProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={(e, index) => handleAddImage(e, index)}
                          >
                            新增圖片
                          </button>
                        )}

                      {/* 設定顯示條件：欄位資料不是唯一的一筆資料 */}

                      {tempProduct.imagesUrl.length > 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={(e, index) => handleDeleteImage(e, index)}
                        >
                          取消圖片
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Modal */}
                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseProductModal}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateProduct}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 刪除產品的Modal */}

      <div
        ref={deleteProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseDeleteProductModal}
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseDeleteProductModal}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteProduct}
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
