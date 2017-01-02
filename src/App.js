import React, { Component } from 'react'
import Rx from 'rxjs/Rx'

import './App.css'

const { Observable, Subject } = Rx

const Placeholder = () => (
  <li className="placeholder">
    <div className="image" />
    <div className="login" style={{ width: `${25 + (Math.random() * 25)}%` }} />
  </li>
)

class App extends Component {
  state = {
    suggestions: [null, null, null],
  }

  refreshStream = new Subject()
  closeStream = new Subject()

  componentDidMount () {
    const responseStream = this.refreshStream
      .startWith('startup click')
      .map(() => 'https://api.github.com/users?since=' + Math.floor(Math.random() * 500))
      .flatMap(url => Observable.ajax(url))
      .map(data => data.response)

    const args = [responseStream, this.closeStream, this.refreshStream]

    this.createSuggestionStream(...args, 0)
    this.createSuggestionStream(...args, 1)
    this.createSuggestionStream(...args, 2)
  }

  createSuggestionStream (responseStream, closeStream, refreshStream, index) {
    return closeStream
      .startWith(index)
      .filter(val => val === index)
      .combineLatest(responseStream,
        (_, users) => users[Math.floor(Math.random() * users.length)]
      )
      .merge(
        refreshStream.map(() => null)
      )
      .startWith(null)
      .subscribe(user => this.setState(state => ({
        suggestions: Object.assign(state.suggestions, { [index]: user })
      })))
  }

  render () {
    const { suggestions } = this.state
    return (
      <section className="who-to-follow">
        <header>
          <h2>Who to follow</h2>
          <button onClick={() => this.refreshStream.next()}>Refresh</button>
        </header>
        <ul>
          {suggestions.map((suggestion, index) => (
            suggestion !== null ? (
              <li key={index}>
                <img src={suggestion.avatar_url} role="presentation" />
                <a href={suggestion.html_url}>{suggestion.login}</a>
                <button onClick={() => this.closeStream.next(index)}>{'\u2715'}</button>
              </li>
            ) : <Placeholder />
          ))}
        </ul>
      </section>
    )
  }
}

export default App
