import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { Map as ImmutableMap } from 'immutable';
import Column from 'soapbox/features/ui/components/better_column';
import {
  SimpleForm,
  FieldsGroup,
  TextInput,
  SimpleTextarea,
  RadioGroup,
  RadioItem,
} from 'soapbox/features/forms';
import { createGroup } from 'soapbox/actions/groups';
import { kebabCase } from 'lodash';

const messages = defineMessages({
  heading: { id: 'column.group_create', defaultMessage: 'Create a new group' },
  slugLabel: { id: 'group_create.fields.slug_label', defaultMessage: 'Group slug' },
  slugPlaceholder: { id: 'group_create.fields.slug_placeholder', defaultMessage: 'my-special-group' },
  slugHint: { id: 'group_create.fields.slug_hint', defaultMessage: 'Like a username, the group\'s slug will show up in URLs and mentions. It CANNOT be changed later. Only letters, numbers, hyphens, and underscores are allowed.' },
  displayNameLabel: { id: 'group_create.fields.display_name_label', defaultMessage: 'Group name' },
  displayNamePlaceholder: { id: 'group_create.fields.display_name_placeholder', defaultMessage: 'My Special Group' },
  noteLabel: { id: 'group_create.fields.note_label', defaultMessage: 'Description' },
  notePlaceholder: { id: 'group_create.fields.note_placeholder', defaultMessage: 'In a few sentences, this group is about...' },
  submit: { id: 'group_create.submit', defaultMessage: 'Create group' },
});

export default @connect()
@injectIntl
class CreateGroup extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    params: ImmutableMap({
      slug: '',
      display_name: '',
      note: '',
      privacy: 'public',
    }),
    isSubmitting: false,
  }

  updateParams = (key, value) => {
    const { params } = this.state;
    const newParams = params.set(key, value);
    this.setState({ params: newParams });
  }

  handleDisplayNameChange = ({ target }) => {
    const { params } = this.state;
    const { display_name, slug } = params.toJS();
    const slugified = kebabCase(display_name);

    if (!slug || slug === slugified) {
      const newParams = params.merge({
        display_name: target.value,
        slug: kebabCase(target.value),
      });
      this.setState({ params: newParams });
    } else {
      this.updateParams('display_name', target.value);
    }
  }

  handleChange = name => {
    return ({ target }) => {
      this.updateParams(name, target.value);
    };
  }

  handleSubmit = e => {
    const { dispatch } = this.props;
    const { params } = this.state;
    const routerHistory = this.context.router.history;

    this.setState({ isSubmitting: true });

    dispatch(createGroup(params))
      .then(group => {
        routerHistory.push(`/groups/${group.slug}`);
      })
      .catch(error => {
        this.setState({ isSubmitting: false });
      });
  }

  render() {
    const { intl } = this.props;
    const { isSubmitting, params } = this.state;
    const { slug, display_name, note, privacy } = params.toJS();
    const disabled = isSubmitting;

    return (
      <Column icon='group' heading={intl.formatMessage(messages.heading)}>
        <SimpleForm onSubmit={this.handleSubmit}>
          <FieldsGroup>
            <TextInput
              value={display_name}
              disabled={disabled}
              onChange={this.handleDisplayNameChange}
              label={intl.formatMessage(messages.displayNameLabel)}
              placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
              required
            />
            <TextInput
              value={slug}
              disabled={disabled}
              onChange={this.handleChange('slug')}
              label={intl.formatMessage(messages.slugLabel)}
              placeholder={intl.formatMessage(messages.slugPlaceholder)}
              hint={intl.formatMessage(messages.slugHint)}
              pattern='[a-z0-9_-]+'
              required
            />
            <SimpleTextarea
              value={note}
              disabled={disabled}
              onChange={this.handleChange('note')}
              label={intl.formatMessage(messages.noteLabel)}
              placeholder={intl.formatMessage(messages.notePlaceholder)}
            />
          </FieldsGroup>
          <FieldsGroup>
            <RadioGroup
              label={<FormattedMessage id='group_create.fields.privacy_label' defaultMessage='Privacy' />}
              onChange={this.handleChange('privacy')}
            >
              <RadioItem
                label={<FormattedMessage id='group_create.fields.privacy.public_label' defaultMessage='Public' />}
                hint={<FormattedMessage id='group_create.fields.privacy.public_hint' defaultMessage='Posts are world-readable.' />}
                checked={privacy === 'public'}
                value='public'
              />
              <RadioItem
                label={<FormattedMessage id='group_create.fields.privacy.members_only_label' defaultMessage='Members only' />}
                hint={<FormattedMessage id='group_create.fields.privacy.members_only_hint' defaultMessage='Only group members can see posts.' />}
                checked={privacy === 'members_only'}
                value='members_only'
              />
            </RadioGroup>
          </FieldsGroup>
          <FieldsGroup>
            <button type='submit'>
              {intl.formatMessage(messages.submit)}
            </button>
          </FieldsGroup>
        </SimpleForm>
      </Column>
    );
  }

}
