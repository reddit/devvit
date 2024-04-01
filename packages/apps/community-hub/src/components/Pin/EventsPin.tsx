import { Context, Devvit } from '@devvit/public-api';

import { Schema } from '../../api/Schema.js';
import { CommonPinProps } from './common.js';
import { z } from 'zod';
import { formatUrl, randomId } from '../../util.js';
import { Page } from '../Page.js';

type EventsPin = z.infer<(typeof Schema)['eventsPin']>;

export const EventsPin = ({
  pin,
  context,
  updatePinPostPin,
  isOwner,
  isRMCAdmin,
  currentUserUsername,
  navigate,
  pinPost: {
    primaryColor: { light },
  },
}: CommonPinProps & { pin: EventsPin }) => {
  const editEventsPage = context.useForm(
    () => {
      return {
        fields: [
          {
            name: 'pinTitle',
            label: `Homepage Button Text`,
            type: 'string',
            defaultValue: pin.pinTitle,
          },
          {
            name: 'header',
            label: `H1`,
            type: 'string',
            defaultValue: pin.header,
          },
          {
            name: 'subheader',
            label: `H2`,
            type: 'string',
            defaultValue: pin.subheader,
          },
        ],
        title: 'Edit Events Page',
        acceptLabel: 'Save',
      };
    },
    async (data) => {
      updatePinPostPin(pin.id, data);
      context.ui.showToast(`Your page has been updated! Refresh.`);
    }
  );

  const eventForm = context.useForm(
    () => {
      return {
        fields: [
          { name: 'title', label: `Event Title`, type: 'string' },
          { name: 'startDate', label: `Date`, type: 'string' },
          {
            name: 'startTime',
            label: `Time`,
            type: 'string',
            placeholder: 'xx:xx pm/am ET',
          },
          {
            name: 'url',
            label: `Link`,
            type: 'string',
            placeholder: 'Link your event',
          },
        ],
        title: 'Add Event',
        acceptLabel: 'Add',
      };
    },
    async (data) => {
      if (pin.events.length > 9) {
        context.ui.showToast(`Sorry, you can only have 10 event listings at one time.`);
        return;
      }

      await updatePinPostPin(pin.id, {
        type: 'events',
        events: [
          ...pin.events,
          {
            id: randomId(),
            enableReminders: true,
            description: '',
            url: data.url,
            startDate: data.startDate,
            startTime: data.startTime,
            title: data.title,
            subscribers: [],
          },
        ],
      });
      context.ui.showToast(`Event added!`);
    }
  );

  const editEventForm = context.useForm(
    (dataArgs) => {
      const data = dataArgs as EventsPin['events'][number];

      return {
        fields: [
          {
            name: 'title',
            label: `Event Title`,
            type: 'string',
            defaultValue: `${data.title}`,
          },
          {
            name: 'startDate',
            label: `Date`,
            type: 'string',
            defaultValue: `${data.startDate}`,
          },
          {
            name: 'startTime',
            label: `Time`,
            type: 'string',
            defaultValue: `${data.startTime}`,
          },
          {
            name: 'url',
            label: `URL`,
            type: 'string',
            defaultValue: `${data.url}`,
          },
          {
            name: 'id',
            label: `Event ID`,
            type: 'string',
            defaultValue: `${data.id}`,
            disabled: true,
          },
        ],
        title: 'Edit Event',
        acceptLabel: 'Save Event',
      };
    },
    async (data) => {
      await updatePinPostPin(pin.id, {
        type: 'events',
        events: pin.events.map((x) => {
          if (x.id === data.id) {
            return {
              ...x,
              ...data,
              // url: data.url,
            };
          }

          return x;
        }),
      });

      context.ui.showToast(`Your event has been updated!`);
    }
  );

  const removeEvent = async (eventId: string) => {
    await updatePinPostPin(pin.id, {
      type: 'events',
      events: pin.events.filter((event) => event.id !== eventId),
    });

    context.ui.showToast('Event successfully removed!');
  };

  const eventSubscribe = async (eventId: string, subscribers: string[]) => {
    const subs = new Set([...subscribers]);
    if (subs.has(currentUserUsername)) {
      subs.delete(currentUserUsername);
      context.ui.showToast('You have successfully unsubscribed from this event.');
    } else {
      subs.add(currentUserUsername);
      context.ui.showToast('You have successfully subscribed to notifications about this event.');
    }
    await updatePinPostPin(pin.id, {
      type: 'events',
      events: pin.events.map((x) => {
        if (x.id === eventId) {
          return {
            ...x,
            subscribers: [...subs],
          };
        }

        return x;
      }),
    });
  };

  const sendNotificationForm = context.useForm(
    (dataArgs) => {
      const data = dataArgs as EventsPin['events'][number];
      return {
        fields: [
          {
            name: 'subject',
            label: `Subject Line`,
            type: 'string',
            defaultValue: `${data.title} starting soon`,
          },
          {
            name: 'body',
            label: `Body Text`,
            type: 'paragraph',
            defaultValue: `${data.title} is starting at ${
              data.startTime
            }! Don't forget to join us. ${data.url ? data.url : ''}`,
          },
          {
            name: 'id',
            label: `Event ID`,
            type: 'string',
            disabled: true,
            defaultValue: `${data.id}`,
          },
        ],
        title: 'Send Event Notification',
        acceptLabel: 'Send',
      };
    },
    async (data) => {
      const { reddit } = context;
      let subs: string[] = [];
      const cE = pin.events.map((event) => {
        if (event.id === data.id) {
          subs = event.subscribers;
        }
      });
      //TODO: add confirmation screen "Are you sure you want to send x messages about this event?"
      if (!subs) {
        context.ui.showToast('Sorry, no one has subscribed to this event.');
        return;
      }
      if (subs.length < 2) {
        await reddit.sendPrivateMessage({
          to: subs[0],
          subject: data.subject,
          text: data.body,
        });
      } else {
        for (const subscriber of subs) {
          await reddit.sendPrivateMessage({
            to: subscriber,
            subject: data.subject,
            text: data.body,
          });
        }
      }
      context.ui.showToast('Success! Notifications sent.');
    }
  );

  const addEventListing: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(eventForm);
  };

  const editPage: Devvit.Blocks.OnPressEventHandler = async () => {
    context.ui.showForm(editEventsPage);
  };

  async function sendRMCSignUps(title: string, subscribers: string[]) {
    const { reddit } = context;
    const admin = await (await reddit.getCurrentUser()).username;
    const text = `${subscribers.map((i) => {
      `* ${i}  
`;
    })}`;
    await reddit.sendPrivateMessage({
      to: admin,
      subject: `${title} Attendees`,
      text: text,
    });
  }

  return (
    <Page>
      {isOwner && (
        <Page.Nav
          buttonStart={{
            buttonStartProps: { onPress: editPage, icon: 'settings' },
            buttonStartText: 'Settings',
          }}
          buttonMiddle={{
            buttonMiddleProps: { onPress: addEventListing, icon: 'add' },
            buttonMiddleText: 'Add Event',
          }}
          buttonEnd={{
            buttonEndProps: { onPress: editPage, icon: 'edit' },
            buttonEndText: 'Edit',
          }}
          bottomBorderColor={{
            light: light,
            dark: 'black',
          }}
        />
      )}
      <Page.Content navigate={navigate}>
        <Page.ContentHeader>{pin.header}</Page.ContentHeader>
        <Page.ContentSubHeader>{pin.subheader}</Page.ContentSubHeader>
        <spacer size={'medium'} />
        <vstack grow gap="small">
          {pin.events.map((event, i) => (
            <hstack>
              <button
                icon="notification"
                appearance="secondary"
                onPress={() => eventSubscribe(event.id, event.subscribers)}
              />
              <spacer size="small" />
              {event.url != null ? (
                <button
                  icon="link"
                  appearance="secondary"
                  onPress={() => {
                    if (event.url) {
                      context.ui.navigateTo(event.url);
                    }
                  }}
                />
              ) : undefined}
              <spacer size="small" />
              <vstack>
                <spacer size="small" />
                <text color="black white" size="large">
                  {event.startDate} at {event.startTime}: {event.title}
                </text>
              </vstack>
              <spacer size="small" />
              {isOwner && (
                <hstack>
                  <button
                    icon="edit"
                    appearance="success"
                    size="small"
                    onPress={() => context.ui.showForm(editEventForm, event)}
                  />
                  <spacer size="small" />
                  <button
                    icon="delete"
                    appearance="success"
                    size="small"
                    onPress={() => removeEvent(event.id)}
                  />
                  <spacer size="small" />
                  <button
                    icon="send"
                    appearance="success"
                    size="small"
                    onPress={() => context.ui.showForm(sendNotificationForm, event)}
                  />
                  {isRMCAdmin && (
                    <hstack alignment="bottom start">
                      <button
                        onPress={() => sendRMCSignUps(event.title, event.subscribers)}
                        icon="download"
                      ></button>
                    </hstack>
                  )}
                </hstack>
              )}
            </hstack>
          ))}
        </vstack>
      </Page.Content>
    </Page>
  );
};
