export default {
  'en': {
    'date': {
      'formats': {'default': '%Y-%m-%d', 'short': '%b %d', 'long': '%B %d, %Y'},
      'day_names': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'abbr_day_names': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'month_names': [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'abbr_month_names': [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      'order': ['year', 'month', 'day']
    },
    'time': {
      'formats': {'default': '%a, %d %b %Y %H:%M:%S %z', 'short': '%a %e %b', 'long': '%a %e %b %Y'},
      'am': 'am',
      'pm': 'pm'
    },
    'support': {'array': {'words_connector': ', ', 'two_words_connector': ' and ', 'last_word_connector': ', and '}},
    'number': {
      'format': {
        'separator': '.',
        'delimiter': ',',
        'precision': 3,
        'significant': false,
        'strip_insignificant_zeros': false
      },
      'currency': {
        'format': {
          'format': '%u%n',
          'unit': '$',
          'separator': '.',
          'delimiter': ',',
          'precision': 2,
          'significant': false,
          'strip_insignificant_zeros': false
        }
      },
      'percentage': {'format': {'delimiter': '', 'format': '%n%'}},
      'precision': {'format': {'delimiter': ''}},
      'human': {
        'format': {'delimiter': '', 'precision': 3, 'significant': true, 'strip_insignificant_zeros': true},
        'storage_units': {
          'format': '%n %u',
          'units': {'byte': {'one': 'Byte', 'other': 'Bytes'}, 'kb': 'KB', 'mb': 'MB', 'gb': 'GB', 'tb': 'TB'}
        },
        'decimal_units': {
          'format': '%n %u',
          'units': {
            'unit': '',
            'thousand': 'Thousand',
            'million': 'Million',
            'billion': 'Billion',
            'trillion': 'Trillion',
            'quadrillion': 'Quadrillion'
          }
        }
      }
    },
    'datetime': {
      'distance_in_words': {
        'half_a_minute': 'half a minute',
        'less_than_x_seconds': {'one': 'less than 1 second', 'other': 'less than %{count} seconds'},
        'x_seconds': {'one': '1 second', 'other': '%{count} seconds'},
        'less_than_x_minutes': {'one': 'less than a minute', 'other': 'less than %{count} minutes'},
        'x_minutes': {'one': '1 minute', 'other': '%{count} minutes'},
        'about_x_hours': {'one': 'about 1 hour', 'other': 'about %{count} hours'},
        'x_days': {'one': '1 day', 'other': '%{count} days'},
        'about_x_months': {'one': 'about 1 month', 'other': 'about %{count} months'},
        'x_months': {'one': '1 month', 'other': '%{count} months'},
        'about_x_years': {'one': 'about 1 year', 'other': 'about %{count} years'},
        'over_x_years': {'one': 'over 1 year', 'other': 'over %{count} years'},
        'almost_x_years': {'one': 'almost 1 year', 'other': 'almost %{count} years'}
      },
      'prompts': {
        'year': 'Year',
        'month': 'Month',
        'day': 'Day',
        'hour': 'Hour',
        'minute': 'Minute',
        'second': 'Seconds'
      }
    },
    'helpers': {
      'select': {'prompt': 'Please select'},
      'submit': {'create': 'Create %{model}', 'update': 'Update %{model}', 'submit': 'Save %{model}'}
    },
    'holds': {'due_soon': 'Due Soon'}
  }
};
