import React, { Component } from 'react';
import { Link } from 'react-router-dom'


class Navbar extends Component {
    render() {
        return (
            <div className="navbar"  >
                <h1 style={{marginLeft:'10px'}}>My Playlist</h1>
                <Link to='/playlists' className='home'> <h1>Home</h1></Link>
            </div>
        );
    }
}

export default Navbar;