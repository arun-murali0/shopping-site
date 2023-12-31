import { useState, createContext, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import { auth } from "./firebase";
import About from "./components/about/About";
import { onAuthStateChanged } from "firebase/auth";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Auth from "./pages/Auth";
import Orders from "./components/myorder/Orders";
import axios from "axios";

axios.defaults.baseURL = "https://shopping-site-ejw5.onrender.com";
// axios.defaults.baseURL = "http://localhost:8756";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
export const DataContainer = createContext();
function App() {
  const [CartItem, setCartItem] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState("");
  const [orders, setOrders] = useState("");
  const [id, setId] = useState();
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/getdata", {
        params: {
          email: user?.email,
        },
      })
      .then((res) => {
        setData(res?.data);
        window.localStorage.setItem("orders", JSON.stringify(res.data));
      })
      .catch((err) => console.log(err.code));
  }, [orders, user]);

  const addToCart = (product, num = 1) => {
    const productExit = CartItem?.find((item) => item?.id === product?.id);
    setId(product?.id);
    if (productExit) {
      setCartItem(
        CartItem?.map((item) =>
          item?.id === product?.id
            ? { ...productExit, qty: productExit?.qty + num }
            : item
        )
      );
    } else {
      setCartItem([...CartItem, { ...product, qty: num }]);
    }
  };

  const decreaseQty = (product) => {
    const productExit = CartItem?.find((item) => item?.id === product?.id);

    if (productExit?.qty === 1) {
      setCartItem(CartItem?.filter((item) => item?.id !== product?.id));
    } else {
      setCartItem(
        CartItem?.map((item) =>
          item?.id === product?.id
            ? { ...productExit, qty: productExit.qty - 1 }
            : item
        )
      );
    }
  };

  const deleteProduct = (product) => {
    setCartItem(CartItem?.filter((item) => item.id !== product.id));
  };
  useEffect(() => {
    localStorage.setItem("cartItem", JSON.stringify(CartItem));
  }, [CartItem]);

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      navigate("/");
    });
    return () => {
      unSubscribe();
    };
  }, []);

  return (
    <DataContainer.Provider
      value={{
        CartItem,
        setCartItem,
        addToCart,
        decreaseQty,
        deleteProduct,
        selectedProduct,
        setSelectedProduct,
      }}
    >
      <Suspense fallback={<Loader />}>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <NavBar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetails />} />
          <Route
            path="/cart"
            element={
              <Cart
                user={user}
                setUser={setUser}
                orders={orders}
                setOrders={setOrders}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={<Login user={user} setUser={setUser} />}
          />
          <Route
            path="/auth"
            element={<Auth user={user} setUser={setUser} />}
          />
          <Route path="/cart/success" element={<Success />} />
          <Route path="/cart/cancel" element={<Cancel />} />
          <Route
            path="/orders"
            element={<Orders orders={orders} cartItem={CartItem} data={data} />}
          />
        </Routes>
        <Footer />
      </Suspense>
    </DataContainer.Provider>
  );
}

export default App;
