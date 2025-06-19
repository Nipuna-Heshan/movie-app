import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({searchTerm, setSearchTerm}) => {
    return (
        <div className="search">
            <div>
                <FaSearch className="search-icon"/>
                <input
                type="text"
                placeholder="Search through thousands of movies"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value)}}/>
            </div>
        </div>
    )
}

export default SearchBar;