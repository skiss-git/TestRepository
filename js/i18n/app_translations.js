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
      'formats': {'default': '%a, %d %b %Y %H:%M:%S %z', 'short': '%d %b %H:%M', 'long': '%B %d, %Y %H:%M'},
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
    'errors': {
      'format': '%{attribute} %{message}',
      'messages': {
        'inclusion': 'is not included in the list',
        'exclusion': 'is reserved',
        'invalid': 'is invalid',
        'confirmation': 'doesn’t match %{attribute}',
        'accepted': 'must be accepted',
        'empty': 'can’t be empty',
        'blank': 'can’t be blank',
        'present': 'must be blank',
        'too_long': 'is too long (maximum is %{count} characters)',
        'too_short': 'is too short (minimum is %{count} characters)',
        'wrong_length': 'is the wrong length (should be %{count} characters)',
        'not_a_number': 'is not a number',
        'not_an_integer': 'must be an integer',
        'greater_than': 'must be greater than %{count}',
        'greater_than_or_equal_to': 'must be greater than or equal to %{count}',
        'equal_to': 'must be equal to %{count}',
        'less_than': 'must be less than %{count}',
        'less_than_or_equal_to': 'must be less than or equal to %{count}',
        'other_than': 'must be other than %{count}',
        'odd': 'must be odd',
        'even': 'must be even'
      }
    },
    'general_failure': 'Something went wrong',
    'holds': {
      'ready': 'Ready for Pickup',
      'transit': 'In Transit',
      'pending': 'Still on Hold',
      'success_message': {
        'one': '1 hold successfully updated.',
        'other': '{{count}} holds successfully updated.',
        'this': 'This hold successfully updated.'
      },
      'error_message': {
        'one': '1 hold failed to update.',
        'other': '{{count}} holds failed to update.',
        'this': 'This hold failed to update.'
      },
      'general_failure': 'Something went wrong',
      'cancelled': {
        'one': '1 hold has been cancelled.',
        'other': '{{count}} holds have been cancelled.',
        'this': '1 hold has been cancelled.'
      },
      'activated': {
        'one': '1 hold has been activated.',
        'other': '{{count}} holds have been activated.',
        'this': 'This hold is now \u003Cstrong\u003Eactive\u003C/strong\u003E. You will receive a copy of this item when it becomes available.'
      },
      'deactivated': {
        'one': '1 hold has been deactivated.',
        'other': '{{count}} holds have been deactivated.',
        'this': 'This hold is now \u003Cstrong\u003Einactive\u003C/strong\u003E. You will keep your place in the waiting list, but the hold will not be sent to you until you make it active.'
      },
      'branch_change': {
        'one': 'Pickup location for 1 hold changed to {{branch}}.',
        'other': 'Pickup location for {{count}} holds changed to {{branch}}.',
        'this': 'Pickup location changed.'
      },
      'expiry_date': {
        'one': 'Expiry date for 1 hold successfully updated.',
        'other': 'Expiry date for {{count}} holds successfully updated.',
        'this': 'Expiry date updated.'
      }
    },
    'checkouts': {
      'success_message': {
        'one': '1 checkout successfully renewed.',
        'other': '{{count}} checkouts successfully renewed.',
        'this': 'This checkout successfully renewed.'
      },
      'error_message': {
        'one': '1 checkout failed to renew.',
        'other': '{{count}} checkouts failed to renew.',
        'this': 'This checkout failed to renew.'
      }
    }
  }
};
