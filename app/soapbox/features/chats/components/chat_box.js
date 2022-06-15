import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { encrypt, createMessage, readKey } from 'openpgp';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';

import {
  sendChatMessage,
  markChatRead,
} from 'soapbox/actions/chats';
import { uploadMedia } from 'soapbox/actions/media';
import { Stack, HStack, IconButton } from 'soapbox/components/ui';
import UploadProgress from 'soapbox/features/compose/components/upload-progress';
import UploadButton from 'soapbox/features/compose/components/upload_button';
import { truncateFilename } from 'soapbox/utils/media';
import { initPgpKey, getPgpKey } from 'soapbox/utils/pgp';

import ChatMessageList from './chat_message_list';

const messages = defineMessages({
  placeholder: { id: 'chat_box.input.placeholder', defaultMessage: 'Send a message…' },
  send: { id: 'chat_box.actions.send', defaultMessage: 'Send' },
});

const mapStateToProps = (state, { chatId }) => ({
  me: state.get('me'),
  account: state.getIn(['accounts', state.me]),
  chat: state.getIn(['chats', 'items', chatId]),
  chatMessageIds: state.getIn(['chat_message_lists', chatId], ImmutableOrderedSet()),
});

const fileKeyGen = () => Math.floor((Math.random() * 0x10000));

export default @connect(mapStateToProps)
@injectIntl
class ChatBox extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    chatId: PropTypes.string.isRequired,
    chatMessageIds: ImmutablePropTypes.orderedSet,
    chat: ImmutablePropTypes.record,
    onSetInputRef: PropTypes.func,
    me: PropTypes.node,
  }

  initialState = () => ({
    content: '',
    attachment: undefined,
    isUploading: false,
    uploadProgress: 0,
    resetFileKey: fileKeyGen(),
    encrypted: false,
  })

  state = this.initialState()

  clearState = () => {
    this.setState(this.initialState());
  }

  encryptMessage = async() => {
    const { chat, account } = this.props;
    const { content } = this.state;

    const keys = await getPgpKey(account.fqn);
    const recipientKeys = await getPgpKey(chat.account);

    const publicKey = await readKey({ armoredKey: recipientKeys.publicKey });
    const privateKey = await readKey({ armoredKey: keys.privateKey });
    const message = await createMessage({ text: content });

    return await encrypt({
      message,
      encryptionKeys: publicKey,
      signingKeys: privateKey,
    });
  }

  getParams = async() => {
    const { content, attachment, encrypted } = this.state;

    return {
      content: encrypted ? await this.encryptMessage() : content,
      media_id: attachment && attachment.id,
    };
  }

  canSubmit = () => {
    const { content, attachment } = this.state;

    const conds = [
      content.length > 0,
      attachment,
    ];

    return conds.some(c => c);
  }

  sendMessage = async() => {
    const { dispatch, chatId } = this.props;
    const { isUploading } = this.state;

    if (this.canSubmit() && !isUploading) {
      const params = await this.getParams();

      dispatch(sendChatMessage(chatId, params));
      this.clearState();
    }
  }

  insertLine = () => {
    const { content } = this.state;
    this.setState({ content: content + '\n' });
  }

  handleKeyDown = (e) => {
    this.markRead();
    if (e.key === 'Enter' && e.shiftKey) {
      this.insertLine();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      this.sendMessage();
      e.preventDefault();
    }
  }

  handleContentChange = (e) => {
    this.setState({ content: e.target.value });
  }

  markRead = () => {
    const { dispatch, chatId } = this.props;
    dispatch(markChatRead(chatId));
  }

  handleHover = () => {
    this.markRead();
  }

  setInputRef = (el) => {
    const { onSetInputRef } = this.props;
    this.inputElem = el;
    onSetInputRef(el);
  };

  handleRemoveFile = (e) => {
    this.setState({ attachment: undefined, resetFileKey: fileKeyGen() });
  }

  onUploadProgress = (e) => {
    const { loaded, total } = e;
    this.setState({ uploadProgress: loaded / total });
  }

  handleFiles = (files) => {
    const { dispatch } = this.props;

    this.setState({ isUploading: true });

    const data = new FormData();
    data.append('file', files[0]);

    dispatch(uploadMedia(data, this.onUploadProgress)).then(response => {
      this.setState({ attachment: response.data, isUploading: false });
    }).catch(() => {
      this.setState({ isUploading: false });
    });
  }

  renderAttachment = () => {
    const { attachment } = this.state;
    if (!attachment) return null;

    return (
      <div className='chat-box__attachment'>
        <div className='chat-box__filename'>
          {truncateFilename(attachment.preview_url, 20)}
        </div>
        <div class='chat-box__remove-attachment'>
          <IconButton
            src={require('@tabler/icons/icons/x.svg')}
            onClick={this.handleRemoveFile}
          />
        </div>
      </div>
    );
  }

  sendPublicKey = async() => {
    const { dispatch, chatId, account } = this.props;
    const { publicKey } = await initPgpKey(account.fqn);

    const params = {
      content: publicKey,
    };

    dispatch(sendChatMessage(chatId, params));
  }

  handleEncryptionButtonClick = () => {
    this.setState({ encrypted: true });
    this.sendPublicKey();
  }

  renderEncryptionButton = () => {
    const { encrypted } = this.state;

    return (
      <IconButton
        className='text-gray-400 hover:text-gray-600'
        iconClassName='h-5 w-5'
        src={encrypted ? require('@tabler/icons/icons/lock.svg') : require('@tabler/icons/icons/lock-open.svg')}
        onClick={this.handleEncryptionButtonClick}
        transparent
      />
    );
  }

  renderActionButton = () => {
    const { intl } = this.props;
    const { resetFileKey } = this.state;

    return this.canSubmit() ? (
      <IconButton
        className='text-gray-400 hover:text-gray-600'
        iconClassName='h-5 w-5'
        src={require('@tabler/icons/icons/send.svg')}
        title={intl.formatMessage(messages.send)}
        onClick={this.sendMessage}
        transparent
      />
    ) : (
      <UploadButton
        iconClassName='h-5 w-5'
        onSelectFile={this.handleFiles}
        resetFileKey={resetFileKey}
      />
    );
  }

  render() {
    const { chatMessageIds, chatId, intl } = this.props;
    const { content, isUploading, uploadProgress } = this.state;
    if (!chatMessageIds) return null;

    return (
      <div className='chat-box' onMouseOver={this.handleHover}>
        <ChatMessageList chatMessageIds={chatMessageIds} chatId={chatId} />
        {this.renderAttachment()}
        <UploadProgress active={isUploading} progress={uploadProgress * 100} />
        <div className='chat-box__actions simple_form'>
          <Stack justifyContent='center' className='absolute right-2.5 inset-y-0'>
            <HStack>
              {this.renderEncryptionButton()}
              {this.renderActionButton()}
            </HStack>
          </Stack>
          <textarea
            rows={1}
            placeholder={intl.formatMessage(messages.placeholder)}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleContentChange}
            value={content}
            ref={this.setInputRef}
          />
        </div>
      </div>
    );
  }

}
