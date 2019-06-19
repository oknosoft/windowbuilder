import * as React from 'react';
import * as Highlighter from 'react-highlight-words';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import InputBase  from '@material-ui/core/Input';
import './react-dadata.css';

declare module 'react' {
  interface InputHTMLAttributes<T> {
    validate?: (value: string) => void
  }
}

export class ReactDadata extends React.PureComponent<ReactDadata.Props, ReactDadata.State> {

  /**
   * HTML-input
   */
  protected textInput?: HTMLInputElement;

  /**
   * XMLHttpRequest instance
   */
  protected xhr?: XMLHttpRequest;

  constructor(props: ReactDadata.Props) {
    super(props);

    this.state = {
      query: this.props.query ? this.props.query : '',
      inputQuery: this.props.query ? this.props.query : '',
      inputFocused: false,
      suggestions: [],
      suggestionIndex: -1,
      suggestionsVisible: true,
      isValid: false
    }
  }

  componentDidMount() {
    if (this.props.autoload && this.state.query) {
      this.fetchSuggestions();
    }
  };

  onInputFocus = () => {
    this.setState({inputFocused: true});
    if (this.state.suggestions.length == 0) {
      this.fetchSuggestions();
    }
  };

  onInputBlur = () => {
    this.setState({inputFocused: false});
    if (this.state.suggestions.length == 0) {
      this.fetchSuggestions();
    }
  };

  onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({query: value, inputQuery: value, suggestionsVisible: true}, () => {
      if (this.props.validate){
        this.props.validate(value);
      }
      this.fetchSuggestions();
    });
  };

  onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.which == 40) {
      // Arrow down
      event.preventDefault();
      if (this.state.suggestionIndex < this.state.suggestions.length) {
        const newSuggestionIndex = this.state.suggestionIndex + 1;
        if(this.state.suggestions[newSuggestionIndex]) {
          const newInputQuery = this.state.suggestions[newSuggestionIndex].value;
          this.setState({suggestionIndex: newSuggestionIndex, query: newInputQuery});
        }
      }
    } else if (event.which == 38) {
      // Arrow up
      event.preventDefault();
      if (this.state.suggestionIndex >= 0) {
        const newSuggestionIndex = this.state.suggestionIndex - 1;
        const newInputQuery = newSuggestionIndex == -1 ? this.state.inputQuery : this.state.suggestions[newSuggestionIndex].value;
        this.setState({suggestionIndex: newSuggestionIndex, query: newInputQuery})
      }
    } else if (event.which == 13) {
      // Enter
      event.preventDefault();
      if (this.state.suggestionIndex >= 0) {
        this.selectSuggestion(this.state.suggestionIndex);
      }
    }
  };

  fetchSuggestions = () => {
    const kind = this.props.kind || 'address';
    if (this.xhr) {
      this.xhr.abort();
    }
    this.xhr = new XMLHttpRequest();
    this.xhr.open("POST", `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/${kind}?5`);
    this.xhr.setRequestHeader("Accept", "application/json");
    this.xhr.setRequestHeader("Authorization", `Token ${this.props.token}`);
    this.xhr.setRequestHeader("Content-Type", "application/json");
    let requestPayload: any = {
      query: this.state.query,
      count: this.props.count ? this.props.count : 10,
    };
    // Checking for granular suggestions
    if (this.props.fromBound && this.props.toBound) {
      // When using granular suggestion, all dadata components have to receive address property that contains shared address info.
      if (!this.props.address) {
        throw new Error("You have to pass address property with DaData address object to connect separate components");
      }
      requestPayload.from_bound = {value: this.props.fromBound};
      requestPayload.to_bound = {value: this.props.toBound};
      requestPayload.restrict_value = true;

      if (this.props.address.data) {
        // Define location limitation
        let location: any = {};
        if (this.props.address.data.region_fias_id) {
          location.region_fias_id = this.props.address.data.region_fias_id;
        }
        if (this.props.address.data.city_fias_id) {
          location.city_fias_id = this.props.address.data.city_fias_id;
        }
        if (this.props.address.data.settlement_fias_id) {
          location.settlement_fias_id = this.props.address.data.settlement_fias_id;
        }
        if (this.props.address.data.street_fias_id) {
          location.street_fias_id = this.props.address.data.street_fias_id;
        }
        requestPayload.locations = [location];
      }
    }
    this.xhr.send(JSON.stringify(requestPayload));

    this.xhr.onreadystatechange = () => {
      if (!this.xhr || this.xhr.readyState != 4) {
        return;
      }

      if (this.xhr.status == 200) {
        const responseJson = JSON.parse(this.xhr.response);
        if (responseJson && responseJson.suggestions) {
          this.setState({suggestions: responseJson.suggestions, suggestionIndex: -1});
        }
      }
    };
  };

  onSuggestionClick = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    this.selectSuggestion(index);
  };

  selectSuggestion = (index: number) => {
    if (this.state.suggestions.length >= index - 1) {
      this.setState({query: this.state.suggestions[index].value, suggestionsVisible: false, inputQuery: this.state.suggestions[index].value}, () => {
        this.fetchSuggestions();
        setTimeout(() => this.setCursorToEnd(this.textInput), 100);
      });

      if (this.props.onChange) {
        this.props.onChange(this.state.suggestions[index]);
      }
    }
  };

  setCursorToEnd = (element) => {
    const valueLength = element.value.length;
    if (element.selectionStart || element.selectionStart == '0') {
      // Firefox/Chrome
      element.selectionStart = valueLength;
      element.selectionEnd = valueLength;
      element.focus();
    }
  };

  getHighlightWords = (): Array<string> => {
    const wordsToPass = ['г', 'респ', 'ул', 'р-н', 'село', 'деревня', 'поселок', 'пр-д', 'пл', 'к', 'кв', 'обл', 'д'];
    let words = this.state.inputQuery.replace(',', '').split(' ');
    words = words.filter((word) => {
      return wordsToPass.indexOf(word) < 0;
    });
    return words;
  };

  render() {
    const {props} = this;
    let classNames = ['react-dadata__input'];
    if (props.className) {
      classNames.push(props.className)
    }

    return (
      <div className="react-dadata react-dadata__container">
        <FormControl fullWidth margin="dense">
          <InputLabel>{props.label}</InputLabel>
          <InputBase
            className={classNames.join(' ')}
            disabled={props.disabled}
            placeholder={props.placeholder ? props.placeholder : ''}
            value={this.state.query}
            inputRef={ (input) => {
              this.textInput = input as HTMLInputElement;
            } }
            onChange={this.onInputChange}
            onKeyPress={this.onKeyPress}
            onKeyDown={this.onKeyPress}
            onFocus={this.onInputFocus}
            onBlur={this.onInputBlur}
            aria-label={props.kind || 'address'}
            inputProps={{
              validate: props.validate,
              autoComplete: props.autocomplete ? props.autocomplete : 'off'
            }}
          />
        </FormControl>
        {this.state.inputFocused && this.state.suggestionsVisible && this.state.suggestions && this.state.suggestions.length > 0 && <div className="react-dadata__suggestions">
          <div className="react-dadata__suggestion-note">Выберите вариант или продолжите ввод</div>
          {this.state.suggestions.map((suggestion, index) => {
            let suggestionClass = 'react-dadata__suggestion';
            if (index == this.state.suggestionIndex) {
              suggestionClass += ' react-dadata__suggestion--current';
            }
            return <div key={suggestion.value} onMouseDown={this.onSuggestionClick.bind(this, index)} className={suggestionClass}><Highlighter highlightClassName="react-dadata--highlighted" autoEscape={true} searchWords={this.getHighlightWords()} textToHighlight={suggestion.value}/></div>
          })}
        </div>}
      </div>
    );
  }
}
