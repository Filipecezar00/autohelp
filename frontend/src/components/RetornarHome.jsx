import { useNavigate } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";

export default function Btn_return() {
  const navigate = useNavigate();
  const VoltarParaHome = () => {
    navigate("/home");
  };
  return <IoArrowBackCircleSharp onClick={VoltarParaHome} />;
}
