import Navbar from "../components/Navbar";
// import GreetingsSection from "../components/GreetingsSection";
import CardGrid from "../components/CardGrid";
// import ProgressBar from  "./components/ProgressBar";
// import NotesButton from ".components/NotesButton";
import "../styles/Home.css";

export default function HomePage () {
    return (
        <div className="home">
            <Navbar/>
            <main className="home-content">
                {/* <GreetingsSection/> */}
                <CardGrid/>
                {/* <ProgressBar/> */}
            </main>
            {/* <NotesButton/> */}
        </div>
    );
}