import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';


const app = new Clarifai.App({
  apiKey: '1f049835a58948eeb19e3081432f0195',
});

const particlesOptions = {
  particles: {
   number: {
     value: 100,
     density: {
       enable: true,
       value_area: 800
     }
   }
  }
}

const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    };

class App extends Component {
  constructor() {
    super();
    this.state = {
      ...initialState,
      route: 'signin',
      isSignedIn: false,
    };
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const imageWidth = Number(image.width);
    const imageHeight = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * imageWidth,
      topRow: clarifaiFace.top_row * imageHeight,
      rightCol: imageWidth - (clarifaiFace.right_col * imageWidth),
      bottomRow: imageHeight - (clarifaiFace.bottom_row * imageHeight),
    }
  }

  displayFaceBox = (box) => {
    console.log('box:', box);
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
      this.setState({imageUrl: this.state.input});
      app.models.predict("a403429f2ddf4b49b307e318f00e528b", this.state.input)
      .then(response => {
        console.log("Current state:", this.state);
        if(response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState({
              user: {
                ...this.state.user,
                entries: count
              }
            })
          })
          .catch(console.log)
        }
      return this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(error => console.log(error))
    }

    onRouteChange = (route) => {
    this.setState({ route: route });
    if(route === 'home') {
      this.setState({ isSignedIn: true })
    }
    else {
      this.setState({
        ...initialState,
        isSignedIn: false
      });
    }
      
    }


  render() {

    const { isSignedIn, box, imageUrl, route } = this.state;

    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === 'home'
          ? <React.Fragment>
              <Logo />
              <Rank count={this.state.user.entries} name={this.state.user.name} />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </React.Fragment>
          : (
            route === 'signin'
            ? <SignIn loadUser = { this.loadUser } onRouteChange = {this.onRouteChange} />
            : <Register loadUser = { this.loadUser } onRouteChange = {this.onRouteChange} />
            )
        }
              
      </div>
    )
  }
}

export default App;