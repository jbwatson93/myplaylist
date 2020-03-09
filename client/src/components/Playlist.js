
import React, { Component } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom'
import ReactPlayer from 'react-player'
import Song from './Song'
import Navbar from './Navbar';



class Playlist extends Component {
    state = {
        playlists: {
            name: "",
            genre: "",
            songs: [{
                name: "",
                artist: '',
                url: '/'
            },],
        },
        nowPlaying: 0,
        loaded: false,
        playing: false,
        edited: false,
        newSong: {
            name: "",
            artist: '',
            url: ''
        },
        lyrics: '',
        songid: '',
    }


    playPause = () => {
        this.setState({ playing: !this.state.playing })
    }
    componentDidMount() {
        this.getPlaylists()
    }
    goback = () => {
        if (0 === this.state.nowPlaying) {
            this.setState({ nowPlaying: this.state.playlists.songs.length - 1 })
        }
        else { this.setState({ nowPlaying: this.state.nowPlaying - 1 }) }

    }
    nowPlaying = () => {
        if (this.state.playlists.songs.length - 1 === this.state.nowPlaying) {
            this.setState({ nowPlaying: 0 })
        }
        else { this.setState({ nowPlaying: this.state.nowPlaying + 1 }) }
        
    }
    addSong = () => {
        axios.post(`/api/playlists/${this.props.match.params.id}/songs`, this.state.newSong)
            .then((res) => {
                const newSong = { ...this.state.playlists }

                newSong.songs.push(res.data)
                this.setState({ playlists: newSong, loaded: true })
            })
    }

    getPlaylists = () => {
        axios.get(`/api/playlists/${this.props.match.params.id}`)
            .then((res) => {
                
                this.setState({
                    playlists: res.data
                })
            }).then((res) => {
                
                if (this.state.playlists.songs[0] === undefined) { }
                else {
                    this.setState({ loaded: true })
                }
            }
            )
    }
    handleChange = (e) => {
        const newSong = { ...this.state.newSong }
        newSong[e.target.name] = e.target.value
        this.setState({ newSong })
    }
    handleChange2 = (e) => {
        const playlists = { ...this.state.playlists }
        playlists[e.target.name] = e.target.value
        this.setState({ playlists })
    }
    deletePlaylist = () => {
        axios.delete(`/api/playlists/${this.props.match.params.id}`)
    }
    editing = () => {
        this.setState({ edited: !this.state.edited })
    }
    updatePlaylist = (e) => {
        e.preventDefault()
        axios.patch(`/api/playlists/${this.props.match.params.id}`, this.state.playlists)
            .then(this.editing())
    }
    getLyrics = () =>{
       
          axios.get(`https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${this.state.songid}&apikey=c0099f439dc1293adae097ceba314746`)
        .then((res) => {
            
            
            if(res.data.message.body.lyrics === undefined){}
            else{
                const lyrics = res.data.message.body.lyrics.lyrics_body
                this.setState({lyrics: lyrics}) 
            }
           
        })
    }
    getsongid = () => {
      
        axios.get(`https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.search?format=json&q_track=${this.state.playlists.songs[this.state.nowPlaying].name}&q_artist=${this.state.playlists.songs[this.state.nowPlaying].artist}&quorum_factor=1&apikey=c0099f439dc1293adae097ceba314746`)
        .then((res)=> {
           const trackid = res.data.message.body.track_list[0].track.track_id
                this.setState({songid: trackid})
        }).then( this.getLyrics)
    }
    render() {
        const song = this.state.playlists.songs[this.state.nowPlaying]
        const back = '|<'
        return (
            <div>
                <Navbar />
                <div className='page'>
                    <h1>{this.state.playlists.name}</h1>
                    {this.state.edited ? <div> <input onChange={(e) => this.handleChange2(e)} name='name' type='text'></input> <button className='addSong' onClick={this.updatePlaylist} > Update Name </button> </div> : null}
                    <p>Genre: {this.state.playlists.genre}</p>

                    <button onClick={this.editing}>Edit</button>

                    {this.state.loaded ? <div className='player-wrapper'><ReactPlayer className='react-player'
                        controls={true} url={song.url}
                        onEnded={this.nowPlaying} 
                        playing={this.state.playing}
                        width='80%'
                        height='80%' /> </div> : null}
                    <div>
                        <button className="controls" onClick={this.goback} > {back}</button>
                        <button className="controls" onClick={this.playPause}>Play</button>
                        <button className="controls" onClick={this.nowPlaying}>>|</button>
                    </div>
                    <div><button onClick={this.getsongid}>Get Lyrics</button></div>
                    <div style={{marginHorizontal: '20px', width:'80%'}}> 
                    {this.state.playlists.songs.map((song, i) => (
                        <Song getSong={this.getPlaylists} id={song._id} name={song.name} artist={song.artist} index={i} nowplaying={this.state.nowPlaying} />
                    ))}
                    </div>
                    <div> <input type='text' name='artist' placeholder='Artist' onChange={(e) => this.handleChange(e)} />
                        <input type='text' name='name' placeholder='Song' onChange={(e) => this.handleChange(e)} />
                        <input type='text' name='url' placeholder='URL' onChange={(e) => this.handleChange(e)} />
                        <button className='addSong' onClick={this.addSong}>Add Song</button>
                    </div>
                    <div className='lyricCont'>
                    <h2>Lyrics</h2>
                    <p className='lyrics'>{this.state.lyrics}</p>
                    </div>
                </div>
                <Link to='/playlists'> <button className='addSong' onClick={this.deletePlaylist}>Delete Playlist</button> </Link>
            </div>
        );
    }
}

export default Playlist;