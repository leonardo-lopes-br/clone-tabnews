exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // Why 96 characters? -> Facebook uses a similar value
    token: {
      type: "varchar(96)",
      notNull: true,
      unique: true,
    },

    // Why not using foreign key?
    // https://github.com/github/gh-ost/issues/331#issuecomment-266027731
    // https://www.shayon.dev/post/2023/355/do-you-really-need-foreign-keys/
    // https://www.reddit.com/r/mysql/comments/wwrv22/hot_take_foreign_keys_are_more_trouble_than_they/
    // https://stackoverflow.com/a/83393
    // https://planetscale.com/docs/vitess/operating-without-foreign-key-constraints#why-does-planetscale-not-recommend-constraints
    user_id: {
      type: "uuid",
      notNull: true,
    },

    expires_at: {
      type: "timestamptz",
      notNull: true,
    },

    // Why timestamp with timezone? -> https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

exports.down = false;
