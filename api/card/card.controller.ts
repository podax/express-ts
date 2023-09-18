import { Request, Response } from 'express';
import Card from './card.model';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';

export const list = async (req: Request, res: Response) => {
  try {
    const user = req.auth;
    const query = {
      limit: req.query.limit || 10,
      offset: req.query.offset || 0,
    };
    let filters;

    if (req.query.status) {
      filters = req.query.status;
    }

    const paginated = await Card.paginate(
      {
        $or: [
          { userId: req.query.userId ? req.query.userId : user.sub },
          { members: { $in: [user.sub] } },
          { status: filters },
        ],
      },
      {
        ...query,
        populate: [
          'template members entries userId',
          {
            path: 'members',
            populate: {
              path: 'userId',
              select: { _id: 1, firstName: 1, lastName: 1, profilePhoto: 1 },
            },
          },
        ],
        sort: { updatedAt: -1 },
      },
    );

    return res.status(200).json({
      success: true,
      paginated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    let item;

    if (cardId.length <= 5) {
      item = await Card.findOne({ shortId: cardId })
        .populate('entries template members')
        .populate({
          path: 'members',
        });
    } else {
      item = await Card.findById(cardId)
        .populate('entries template members')
        .populate({
          path: 'members',
          justOne: true,
        });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Not Found',
      });
    }

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getcard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    let item;

    if (cardId.length <= 5) {
      item = await Card.findOne({ shortId: cardId });
    } else {
      item = await Card.findById(cardId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Not Found',
      });
    }

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Please enter required details.',
      });
    }

    const cardDetails = await Card.findById(id);

    if (!cardDetails) {
      return res.status(400).json({
        success: false,
        message: 'Card not found',
      });
    }

    if (cardDetails.userId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'You are not owner of the card',
      });
    }

    const removeCard = await Card.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });

    if (removeCard) {
      return res.status(200).json({
        success: true,
        message: 'Card removed successfully',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.title || !data.template) {
      return res.status(400).json({
        success: false,
        message: 'Please enter required details',
      });
    }

    let encoded_uid;
    const _encode = async () => {
      const uid = UidGenerator();
      const card = await Card.find({ shortId: uid });

      if (card && card.length > 0) {
        _encode();
      } else {
        encoded_uid = uid;
      }
    };

    await _encode();
    const assetsData = await Template.findById(data.template, 'assets scan');

    if (!assetsData) {
      return res.status(400).json({
        success: false,
        message: "Didn't get assets",
      });
    }

    const item = await Card.create({
      userId: data.userId,
      shortId: data.shortId ? data.shortId : encoded_uid,
      title: data.title,
      description: data.description,
      template: data.template,
      assets: assetsData.assets[0] ? [{ url: assetsData.assets[0].url }] : [],
      scan: { limit: assetsData.scan.limit },
    });

    await Template.findByIdAndUpdate(
      data.template,
      {
        $inc: { popular: 1 },
      },
      { upsert: true },
    );

    if (item.userId) {
      const cardMemberDetails = await CardMember.create({
        userId: req.body.userId,
        cardId: item._id,
        limits: { video: 5 },
      });
      let cardDetails;

      if (cardMemberDetails) {
        cardDetails = await Card.findByIdAndUpdate(
          item._id,
          {
            $push: { members: cardMemberDetails._id },
          },
          { upsert: true, new: true },
        );
      }

      await logActivity({
        cardId: item._id,
        actorId: req.body.userId,
        type: CREATE,
      });

      if (cardDetails) {
        return res.status(200).json({ success: true, data: cardDetails });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Something went wrong',
        });
      }
    }

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const enableCustomFonts = () => {
  // Create the font config file
  const fontDir = path.resolve(path.join(__dirname, '../../', 'fonts'));
  // console.log(fontDir);
  fs.writeFileSync(
    path.join(fontDir, 'fonts.conf'),
    fontConfigTemplate(fontDir),
  );
  // Set the environment variable path
  process.env.FONTCONFIG_PATH = fontDir;
  process.env.PANGOCAIRO_BACKEND = 'fontconfig';
  // Set font config debugging to true
  process.env.FC_DEBUG = '1';
  console.log(shell.exec('fc-list').stdout);
};

const fetchUrlAsBuffer = async (assets: any) => {
  let promises = [];

  for (const asset of assets) {
    promises.push(await axios.get(asset.url, { responseType: 'arraybuffer' }));
  }

  return (await Promise.all(promises)).map((response) => response.data);
};

export const downloadAsJpg = async (
  assets,
  resize = 4,
  quality = 100,
  width = config.card.defaultWidth,
  height = config.card.defaultHeight,
) => {
  let promises = [];

  for (const asset of assets) {
    promises.push(
      await sharp(asset)
        .resize({ width: width * resize, height: height * resize })
        .jpeg({
          quality: quality,
        })
        .withMetadata({ density: 300 })
        .toBuffer(),
    );
  }

  return await Promise.all(promises);
};

export const downloadPdf = async (req: Request, res: Response) => {
  try {
    enableCustomFonts();

    const { id } = req.params;
    const resize = 1;
    const { file_type = 'png', jpeg_quality = 100, pageSize = 'A5' } = req.body;
    let buffers;

    const item = await Card.findById(id).populate('template');
    let itemWidth = item.template.width;
    let itemHeight = item.template.height;
    let pageOrientation = item.template.orientation || 'portrait';

    let data = await fetchUrlAsBuffer(item.assets);
    buffers = await downloadAsJpg(data, 1, 100, itemWidth, itemHeight);
    res.setHeader('content-type', 'application/pdf');

    const doc = new PDFDocument({
      size: pageSize,
      layout: pageOrientation,
      autoFirstPage: false,
    });
    doc.pipe(res);

    const imageDimensions = [SIZE[pageSize][0], SIZE[pageSize][1]];

    if (pageOrientation === 'landscape') {
      imageDimensions = [SIZES[pageSize][1], [SIZES[pageSize][0]]];
    }

    buffers.forEach((buffer: any) => {
      doc.addPage();
      doc.image(buffer, 0, 0, {
        width: imageDimensions[0],
        height: imageDimensions[1],
      });
    });
    doc.end();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createEmptyCards = async (req: Request, res: Response) => {
  try {
    const user = req.auth;
    let data = req.body;

    if (!data.title && !data.template) {
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }

    let encoded_uid;
    const _encode = async () => {
      const uid = UidGenerator();
      const card = await Card.find({ short: uid });
      if (card && card.length > 0) {
        _encode();
      } else {
        encoded_uid = uid;
      }
    };
    await _encode();
    const assetsData = await Template.findById(data.template, 'assets');

    if (!assetsData) {
      return res.status(400).json({
        success: false,
        message: "Didn't get assets",
      });
    }

    const emptycards = await Card.create({
      shortId: data.shortId ? data.shortId : encoded_uid,
      title: data.title,
      description: data.description,
      template: data.template,
      assets: [
        {
          url: assetsData.assets[0].url || [],
        },
      ],
    });

    if (!emptycards) {
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }

    return res.status(200).json({
      success: true,
      data: emptycards,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
