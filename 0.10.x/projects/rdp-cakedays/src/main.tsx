import { Devvit, KVStore, Post, RedditAPIClient, User } from '@devvit/public-api';

const POST_HEIGHT = "regular"
const MAX_ITEMS = (POST_HEIGHT == "regular") ? 3 : 4;

const defaultSnoovatarUrl =
  "https://www.redditstatic.com/shreddit/assets/thinking-snoo.png";

Devvit.configure({
  redditAPI: true,
  kvStore: true,
});

type CakeDayer = { 
  username: string,
  id : string,
  snoovatarUrl : string,
  isFriend?: boolean // this is an id specific to the celebration
}

type CurrentUser = {
  id: string;
  username: string;
  createdAt: string;
}

type CakedayListItemProps = {
  cakedayer: CakeDayer,
  isCelebrated: boolean,
  isFriend?: boolean | undefined,
  onPress: Devvit.Blocks.OnPressEventHandler    
}

type CelebrateJobProps = {
  celebratee : CakeDayer,
  celebrator : CakeDayer,
  today : string
}

Devvit.addMenuItem({
  label: 'Add Cakeday test data',
  location: 'subreddit',
  forUserType: "moderator",
  onPress: async (_, {reddit, kvStore, ui}) => {

    const today = new Date().toISOString().split('T')[0];
    console.log(`Getting current user`);
    const user = await reddit.getCurrentUser();
    const cd : CakeDayer = {username : user.username, id : user.id, snoovatarUrl : defaultSnoovatarUrl};
    
    console.log(`Storing user`);
    await kvStore.put(today, [
      {username : 'bleepbloop', id : `${user.id}`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'RelevantTumbleweed16', id : `${user.id}2`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'blarpbedoop45', id : `${user.id}3`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'didgerdoop', id : `${user.id}4`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'fleeeeeeeem', id : `${user.id}5`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'Spooooooooon', id : `${user.id}6`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'splurb', id : `${user.id}7`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'dlurp', id : `${user.id}8`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'barlgsperg', id : `${user.id}9`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'giggity', id : `${user.id}10`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'foobar', id : `${user.id}11`, snoovatarUrl : defaultSnoovatarUrl},
      {username : 'thisisalotocakes', id : `${user.id}12`, snoovatarUrl : defaultSnoovatarUrl},

  ]);

    ui.showToast({text : `Fake Cakedays added!`});
    
  },
});

Devvit.addMenuItem({
  label: 'New Cakeday post',
  location: 'subreddit',
  forUserType: "moderator",
  onPress: async (_, { reddit, ui }) => {

    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      preview: (
        <vstack padding='medium' cornerRadius='medium'>
          <text style="heading" size="medium">
              Loading cakedays...
          </text>
        </vstack>
      ),
      title: `${subreddit.name} Cakedays`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Cakedays post!`,
      appearance: "success",
    });
  },
});

Devvit.addMenuItem({
  label: 'Clear Cakeday KVStore',
  location: 'subreddit',
  forUserType: "moderator",
  onPress: async (_, { kvStore, ui }) => {

    const dates = await kvStore.list();
    for (var day in dates ) {
      console.log(`Deleting ${dates[day]}`);
      await kvStore.delete(dates[day]);
    }

    ui.showToast({
      text: `Successfully cleared Cakedays KVStore!`,
      appearance: "success",
    });
  },
});

function CakedayListItem({cakedayer, isCelebrated, isFriend, onPress} : CakedayListItemProps) {
  let friendText;
  
  friendText = (isFriend) ? <text>High-fived you!</text> : undefined;

  return (
   <hstack alignment='middle' gap='small'>
      <image url={defaultSnoovatarUrl} imageHeight={32} imageWidth={32}/>
      <text size='large' weight='bold' grow={true} alignment='start'>{cakedayer.username}</text>
      { friendText }
      <button 
          icon={
            (isCelebrated) ? 'raise-hand-fill' : 'raise-hand-outline'
          } 
      onPress={onPress}>
      </button>
    </hstack>
  )
}

const CELEBRATE_ACTION_ID = "celebrate";

Devvit.addSchedulerJob({
  name: CELEBRATE_ACTION_ID,
  onRun: async (event, context) => {
    
    const { celebratee, celebrator, today } = event.data! as CelebrateJobProps;
    
    // myCelebrated persists who I've high-fived today so I don't high-five them twice
    var myCelebrated = await context.kvStore.get(`${celebrator.username}:celebrated:${today}`) as Array<CakeDayer>;

    if (myCelebrated) {
      myCelebrated = [...myCelebrated, celebratee];
    } else {
      console.log("Not myCelebrated...");
      myCelebrated = [celebratee];
    }
    
    console.log(`Scheduler: ${celebrator.username}'s celebrated: ${JSON.stringify(myCelebrated)}`);

    // Persist cross-session state
    await context.kvStore.put(`${celebrator.username}:celebrated:${today}`, myCelebrated);

    // yourFriends logs the people I high-five. They see I high-fived them and they can high-five me back
    var yourFriends = await context.kvStore.get(`${celebratee.username}:myFriends`) as Array<CakeDayer>;

    if (yourFriends) {
      yourFriends = [...yourFriends, celebrator];
    } else {
      yourFriends = [celebrator];
    }
    
    await context.kvStore.put(`${celebratee.username}:myFriends`, yourFriends);
    
    console.log(`Scheduler: ${celebratee.username}'s friends: ${JSON.stringify(yourFriends)}`);

    // if this person was a friend, then remove them from my list of friends to high five
    var myFriends = await context.kvStore.get(`${celebrator.username}:myFriends`) as Array<CakeDayer>;

    if (myFriends) {
      myFriends = myFriends.filter((c) => {
        return c.username != celebratee.username;
      });
      await context.kvStore.put(`${celebrator.username}:myFriends`, myFriends);
    } 
    
  },
});

Devvit.addCustomPostType({
  name: 'Cakedays',
  render: ({ reddit, kvStore, useState, scheduler }) => {
    
    const [currentUser] = useState<CurrentUser>(async () => {
       const user = await reddit.getCurrentUser();
       return {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt.toISOString(),
        };
      }
    );

    // Get a list of uncelebrated cakedayers + friends (people who have high-fived me)
    const [cakeDayers]  = useState(async () => {
      console.log("Getting cakedayers: in function");
      const today = new Date().toISOString().split('T')[0];
      var cakeDayers = await kvStore.get(today) as Array<CakeDayer>;
      const myCelebrated = await kvStore.get(`${currentUser.username}:celebrated:${today}`) as Array<CakeDayer>;
      
      console.log(`Render loop: ${currentUser.username} celebrated ${JSON.stringify(myCelebrated)}`);
      // Remove anyone I've already celebrated today
      let celebratedNames = [currentUser.username]; // ignore yourself

      if (myCelebrated) {
        celebratedNames = celebratedNames.concat(myCelebrated.map((c) => {return c.username}));
      }

      console.log(`My celebrated names ${celebratedNames}`);

      if (cakeDayers) {
        cakeDayers = cakeDayers.filter((c) => {
          return !celebratedNames.includes(c.username);
        });
      }
      
      // Get all the people that high-fived me
      const friends = await kvStore.get(`${currentUser.username}:myFriends`) as Array<CakeDayer>;
      
      console.log(`Render loop: ${currentUser.username} friends ${JSON.stringify(friends)}`);
      
      if (friends) {
        return friends.concat(cakeDayers);
      } else {
        return cakeDayers;      
      }
      
    });
        
    const [start, setStart] = useState(0);
    
    const [currentUserIsAdded, setCurrentUserIsAdded] = useState(async () => {
      return (await kvStore.get(currentUser.id)) !== undefined;
    });
    
    const [myFellowCakedayers] = useState(async () => {
      const cakeday = currentUser.createdAt.split("T")[0];
      console.log(`Creating cakeday at ${cakeday}`);
      var users = await kvStore.get(cakeday) as Array<CakeDayer>;
      console.log(`Users for this day: ${JSON.stringify(users)}`);
      return users;
    });
    
    const [celebrated, setCelebrated] = useState(['']);
    
    const [myFriends] = useState(async () => {
      return await kvStore.get(`${currentUser.username}:myFriends`) as Array<string>;
    });
    
    const [myCelebrated] = useState(async () => {
      const today = new Date().toISOString().split('T')[0];
      return await kvStore.get(`${currentUser.username}:celebrated:${today}`) as Array<string>;
    });

    const isMyCakeday = (currentUser.createdAt.split("T")[0] == new Date().toISOString().split("T")[0]); // || currentUser.username == "FlyingLaserTurtle";

    try {      
      let header, friends, content, footer, downBtn, upBtn;

      if (cakeDayers && cakeDayers.length > 0 ) {     
          
        content = cakeDayers.slice(start, start + MAX_ITEMS).map( (cd : CakeDayer) => {
          
          return (<CakedayListItem 
            cakedayer={cd} 
            isCelebrated={celebrated.includes(cd.username)} 
            isFriend={cd.isFriend}
            onPress={async () => {

              // Store in-session state
              setCelebrated(celebrated => [...celebrated, cd.username]);

              const today = new Date().toISOString().split('T')[0];
              
              // Note: no `await` here--just fall through to not block the UX thread
              scheduler.runJob(
                {
                  name: CELEBRATE_ACTION_ID,
                  data: {
                    celebratee: cd,
                    celebrator: { 
                      username : currentUser.username, 
                      id : undefined,
                      snoovatarUrl : defaultSnoovatarUrl,
                      isFriend: true
                    },
                    today: today
                  },
                  runAt: new Date(),
                },);
            }
          } 
          />); 
          }
        );

        // Pagination
        if (cakeDayers.length > MAX_ITEMS) {
          downBtn = <button size='small' appearance='secondary' disabled={start + MAX_ITEMS >= cakeDayers.length}  onPress={() => {setStart(Math.min(start+MAX_ITEMS, cakeDayers.length-1))}} icon='down-arrow-fill'></button>; 
        }

        if (downBtn || start > 0) {
          upBtn = <button size='small' appearance='secondary' disabled={(start==0)} onPress={() => {setStart((Math.max(start-MAX_ITEMS, 0)))}} icon='up-arrow-fill'></button>;
        }

      } else {
        content = <text size='xlarge' alignment='center'>No more cakedays today =/</text>;
      }

      if (isMyCakeday) {
        header = <hstack gap='none' alignment='center'>
            <text size='large' weight='bold' color='red'>H</text>
            <text size='large' weight='bold' color='orange'>a</text>
            <text size='large' weight='bold' color='#FFEA00'>p</text>
            <text size='large' weight='bold' color='green'>p</text>
            <text size='large' weight='bold' color='blue'>y</text>
            <spacer size='small' />
            <text size='large' weight='bold' color='#4b369d'>C</text>
            <text size='large' weight='bold' color='#70369d'>a</text>
            <text size='large' weight='bold' color='red'>k</text>
            <text size='large' weight='bold' color='orange'>e</text>
            <text size='large' weight='bold' color='#FFEA00'>d</text>
            <text size='large' weight='bold' color='green'>a</text>
            <text size='large' weight='bold' color='blue'>y</text>
            <text size='large' weight='bold' color='#4b369d'>!</text>
        </hstack>
      }
      if (currentUserIsAdded) {
        footer = <text size='xsmall' alignment='center'>You're on the list! Check back on {currentUser.createdAt.split("T")[0]}</text>;
      } else { 
          footer = <button appearance='primary' onPress={async () => {
          const me : CakeDayer = {username : currentUser.username, id : currentUser.id, snoovatarUrl : defaultSnoovatarUrl };
          const newCakedaylist : Array<CakeDayer> = (myFellowCakedayers) ? [...myFellowCakedayers, me] : [me];
          await kvStore.put(currentUser.createdAt.split("T")[0], newCakedaylist);
          await kvStore.put(currentUser.id, true);
          setCurrentUserIsAdded(true);
          }
        }>Add me</button>
      }
      return (
        <blocks height={POST_HEIGHT}>
            <vstack padding="small" gap="small" cornerRadius="medium">
              { header }
              <vstack padding="medium" border='thin' gap='small' borderColor='#eee' cornerRadius="medium">              
                { content }
                (upBtn || downBtn) ? <hstack alignment='center bottom' gap='small'>{upBtn}{downBtn}</hstack>;
              </vstack>              
              { footer }
            </vstack>
        </blocks>
        ); 
  } catch (e) {
    console.log(`${JSON.stringify(e)}`);
  }
}
});

function genId() : string {
  return Math.random().toString(36).substring(2, 9);
}

export default Devvit;